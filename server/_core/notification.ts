export async function notifyOwner({ title, content }: { title: string; content: string }) {
  console.log("[notifyOwner]", title, content);
  return true;
}
