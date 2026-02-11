import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/channels - List all channels
export async function GET() {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { messages: true, members: true },
        },
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Failed to fetch channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

// POST /api/channels - Create a new channel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isPrivate = false, creatorId } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    const channel = await prisma.channel.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPrivate,
        members: creatorId
          ? {
              create: {
                userId: creatorId,
                role: "OWNER",
              },
            }
          : undefined,
      },
      include: {
        _count: {
          select: { messages: true, members: true },
        },
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Failed to create channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}
