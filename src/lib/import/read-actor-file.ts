import type { FoundryActor } from "../models/foundry-actor";
import { validateFoundryActor } from "./validate-foundry-actor";

export interface ImportedActorFile {
  fileName: string;
  actor: FoundryActor;
}

export async function readActorFile(
  file: File
): Promise<ImportedActorFile> {
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Please select a JSON file exported from Foundry.");
  }

  let text: string;

  try {
    text = await file.text();
  } catch {
    throw new Error("The selected file could not be read.");
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("The selected file does not contain valid JSON.");
  }

  return {
    fileName: file.name,
    actor: validateFoundryActor(data)
  };
}