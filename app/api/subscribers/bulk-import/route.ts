import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import Group from "@/models/Group";

interface CSVRow {
  name: string;
  email: string;
  service: string;
  nextDate?: string;
  nextSendDate?: string;
  groupName?: string;
  [key: string]: string | undefined; // For custom variables
}

// POST: Bulk import subscribers from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { csvData, groupId, createGroups = false } = body;

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json({ error: "Invalid CSV data" }, { status: 400 });
    }

    await connectDB();

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>,
      groupsCreated: [] as string[],
    };

    // Track created groups to avoid duplicates
    const groupCache = new Map<string, string>(); // groupName -> groupId

    for (let i = 0; i < csvData.length; i++) {
      const row: CSVRow = csvData[i];

      try {
        // Validate required fields
        if (!row.name || !row.email || !row.service) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: row.email || 'unknown',
            error: 'Missing required fields (name, email, service)',
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: row.email,
            error: 'Invalid email format',
          });
          continue;
        }

        // Check for duplicate email
        const existingSubscriber = await Subscriber.findOne({
          userId: session.user.id,
          email: row.email.toLowerCase(),
        });

        if (existingSubscriber) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: row.email,
            error: 'Email already exists',
          });
          continue;
        }

        // Determine group assignment
        let assignedGroupId = groupId;

        if (createGroups && row.groupName) {
          // Check if group already created in this batch
          if (groupCache.has(row.groupName)) {
            assignedGroupId = groupCache.get(row.groupName);
          } else {
            // Check if group exists in database
            const existingGroup = await Group.findOne({
              userId: session.user.id,
              name: row.groupName,
            });

            if (existingGroup) {
              assignedGroupId = existingGroup._id.toString();
              groupCache.set(row.groupName, assignedGroupId);
            } else {
              // Need to create group - but this requires a template
              // Skip for now and require manual group assignment
              results.failed++;
              results.errors.push({
                row: i + 1,
                email: row.email,
                error: `Group "${row.groupName}" does not exist. Create it first or use existing group.`,
              });
              continue;
            }
          }
        }

        // Extract custom variables (any column not in standard fields)
        const standardFields = ['name', 'email', 'service', 'nextDate', 'nextSendDate', 'groupName'];
        const customVariables: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(row)) {
          if (!standardFields.includes(key) && value !== undefined) {
            customVariables[key] = value;
          }
        }

        // Parse dates with validation
        let nextDate: Date | undefined;
        let nextSendDate: Date | undefined;
        
        if (row.nextDate) {
          try {
            nextDate = new Date(row.nextDate);
            if (isNaN(nextDate.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (e) {
            results.failed++;
            results.errors.push({
              row: i + 1,
              email: row.email,
              error: `Invalid nextDate format: ${row.nextDate}`,
            });
            continue;
          }
        }
        
        if (row.nextSendDate) {
          try {
            nextSendDate = new Date(row.nextSendDate);
            if (isNaN(nextSendDate.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (e) {
            results.failed++;
            results.errors.push({
              row: i + 1,
              email: row.email,
              error: `Invalid nextSendDate format: ${row.nextSendDate}`,
            });
            continue;
          }
        } else if (nextDate) {
          // Default nextSendDate to nextDate if not provided
          nextSendDate = nextDate;
        }

        // Create subscriber
        await Subscriber.create({
          userId: session.user.id,
          groupId: assignedGroupId || undefined,
          name: row.name.trim(),
          email: row.email.toLowerCase().trim(),
          service: row.service.trim(),
          nextDate,
          nextSendDate,
          isActive: true,
          customVariables: Object.keys(customVariables).length > 0 ? customVariables : undefined,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          email: row.email || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.success} succeeded, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to import subscribers" },
      { status: 500 }
    );
  }
}
