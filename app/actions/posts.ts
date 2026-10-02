"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

// ============================================
// 1. جلب كل البوستات
// ============================================
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { success: false, error: "فشل في جلب البوستات" };
  }
}

// ============================================
// 2. إنشاء بوست جديد
// ============================================
export async function createPost(content: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    await prisma.post.create({
      data: {
        content,
        authorId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "فشل في نشر البوست" };
  }
}

// ============================================
// 3. حذف بوست
// ============================================
export async function deletePost(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== user.id) {
      return { success: false, error: "غير مصرح" };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "فشل في حذف البوست" };
  }
}

// ============================================
// 4. إنشاء كومنت
// ============================================
export async function createComment(postId: string, text: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    await prisma.comment.create({
      data: {
        text,
        postId,
        authorId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "فشل في إضافة الكومنت" };
  }
}

// ============================================
// 5. حذف كومنت
// ============================================
export async function deleteComment(commentId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== user.id) {
      return { success: false, error: "غير مصرح" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "فشل في حذف الكومنت" };
  }
}
// ============================================
// 6. تعديل بوست
// ============================================
export async function updatePost(postId: string, content: string) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        return { success: false, error: "يجب تسجيل الدخول" };
      }
  
      if (!content.trim()) {
        return { success: false, error: "المحتوى فارغ" };
      }
  
      // نتأكد إنه المستخدم صاحب البوست
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });
  
      if (!post || post.authorId !== user.id) {
        return { success: false, error: "غير مصرح" };
      }
  
      await prisma.post.update({
        where: { id: postId },
        data: { content },
      });
  
      revalidatePath("/");
      return { success: true };
    } catch (error) {
      console.error("Error updating post:", error);
      return { success: false, error: "فشل في تعديل البوست" };
    }
  }
  
  // ============================================
  // 7. تعديل كومنت
  // ============================================
  export async function updateComment(commentId: string, text: string) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        return { success: false, error: "يجب تسجيل الدخول" };
      }
  
      if (!text.trim()) {
        return { success: false, error: "النص فارغ" };
      }
  
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
  
      if (!comment || comment.authorId !== user.id) {
        return { success: false, error: "غير مصرح" };
      }
  
      await prisma.comment.update({
        where: { id: commentId },
        data: { text },
      });
  
      revalidatePath("/");
      return { success: true };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { success: false, error: "فشل في تعديل الكومنت" };
    }
  }