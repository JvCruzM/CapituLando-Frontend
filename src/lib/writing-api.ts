import { apiRequest } from "@/lib/api";

export interface Story {
  id: string;
  title: string;
  synopsis?: string | null;
  description?: string | null;
  genre?: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  progressPercentage: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  orderIndex: number;
  title: string;
  content: string;
  wordCount: number;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
}

export interface WritingProject extends Story {
  chapters: Chapter[];
  drafts: Chapter[];
}

export async function loadWritingProjects(): Promise<WritingProject[]> {
  const stories = await apiRequest<Story[]>("/stories");
  return Promise.all(
    stories.map(async (story) => {
      const chapters = await apiRequest<Chapter[]>(
        `/stories/${story.id}/chapters`,
      );
      return {
        ...story,
        chapters: chapters
          .filter((chapter) => chapter.status !== "DRAFT")
          .map((chapter) => ({ ...chapter, content: chapter.content || "" })),
        drafts: chapters
          .filter((chapter) => chapter.status === "DRAFT")
          .map((chapter) => ({ ...chapter, content: chapter.content || "" })),
      };
    }),
  );
}

export function createStory(
  input: Pick<Story, "title" | "genre" | "description">,
) {
  return apiRequest<Story>("/stories", {
    method: "POST",
    body: JSON.stringify({ ...input, status: "DRAFT", progressPercentage: 0 }),
  });
}

export function updateStory(story: Story) {
  return apiRequest<Story>(`/stories/${story.id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: story.title,
      synopsis: story.synopsis,
      description: story.description,
      genre: story.genre,
      status: story.status,
    }),
  });
}

export function deleteStory(storyId: string) {
  return apiRequest<void>(`/stories/${storyId}`, { method: "DELETE" });
}

export function saveChapter(
  storyId: string,
  chapter: Pick<Chapter, "title" | "content" | "status">,
  chapterId?: string,
) {
  return apiRequest<Chapter>(
    `/stories/${storyId}/chapters${chapterId ? `/${chapterId}` : ""}`,
    {
      method: chapterId ? "PUT" : "POST",
      body: JSON.stringify(chapter),
    },
  );
}

export function deleteChapter(storyId: string, chapterId: string) {
  return apiRequest<void>(`/stories/${storyId}/chapters/${chapterId}`, {
    method: "DELETE",
  });
}
