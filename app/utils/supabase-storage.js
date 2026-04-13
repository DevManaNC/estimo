import { getSupabase } from "../lib/supabase";

export async function loadProjectsFromDB(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Load projects error:", error);
    return [];
  }

  // Convert DB rows to the app's project format
  return data.map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...row.data,
  }));
}

export async function saveProjectToDB(userId, project) {
  const supabase = getSupabase();
  const { id, name, createdAt, updatedAt, ...data } = project;

  const { error } = await supabase
    .from("projects")
    .upsert({
      id,
      user_id: userId,
      name,
      data,
      created_at: createdAt,
    }, { onConflict: "id" });

  if (error) console.error("Save project error:", error);
}

export async function deleteProjectFromDB(projectId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) console.error("Delete project error:", error);
}

export async function migrateLocalProjects(userId) {
  const STORAGE_KEY = "chiffrage-projects-v2";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;

    const projects = JSON.parse(raw);
    if (!Array.isArray(projects) || projects.length === 0) return 0;

    for (const project of projects) {
      await saveProjectToDB(userId, project);
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("chiffrage-projects-v1");
    return projects.length;
  } catch (err) {
    console.error("Migration error:", err);
    return 0;
  }
}
