import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isTeacher } from '@/lib/teacher'

// Attachment type-e attachmentId chilo jeta error dichhilo, ota soriye shudhu courseId rakha hoyeche
type Params = Promise<{
  courseId: string
}>

export async function POST(
  request: NextRequest, 
  { params }: { params: Params } // Context properly typed for Next.js 16
) {
  try {
    const { courseId } = await params // Await kora hoyeche jate error na ase
    const { userId } = await auth()
    const { url } = await request.json()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId, // createdById er jaygay userId check kore dekhen schema te ki ache
      },
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split('/').pop(),
        courseId: courseId,
      },
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.log("[ATTACHMENTS_POST]", error);
    return new NextResponse('Internal server error', { status: 500 })
  }
}
