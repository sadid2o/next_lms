import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isTeacher } from '@/lib/teacher'

type Params = Promise<{
  courseId: string
}>

export async function POST(
  request: NextRequest, 
  { params }: { params: Params }
) {
  try {
    const { courseId } = await params
    const { userId } = await auth()
    const { url } = await request.json()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Schema onujayi createdById use kora hoyeche
    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        createdById: userId, // Schema-r 'createdById' field use kora holo
      },
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split('/').pop() || "attachment",
        courseId: courseId,
      },
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.log("[ATTACHMENTS_POST]", error);
    return new NextResponse('Internal server error', { status: 500 })
  }
}
