import { characterDatabase } from "./character-database";
import type { FoundryActor } from "../models/foundry-actor";
import type { StoredCharacter } from "../models/stored-character";

export async function getAllCharacters(): Promise<StoredCharacter[]> {
  return characterDatabase.characters
    .orderBy("name")
    .toArray();
}

export async function getCharacter(
  localId: string
): Promise<StoredCharacter | undefined> {
  return characterDatabase.characters.get(localId);
}

export async function saveImportedCharacter(
  actor: FoundryActor,
  sourceFileName: string
): Promise<StoredCharacter> {
  const existing = actor._id
    ? await characterDatabase.characters
        .where("foundryActorId")
        .equals(actor._id)
        .first()
    : undefined;

  const character: StoredCharacter = {
    localId: existing?.localId ?? crypto.randomUUID(),
    foundryActorId: actor._id,
    name: actor.name,
    actorType: actor.type,
    portraitPath: actor.img,
    sourceFileName,
    importedAt: new Date().toISOString(),
    foundryVersion: actor._stats?.coreVersion,
    systemVersion: actor._stats?.systemVersion,
    actor
  };

  await characterDatabase.characters.put(character);

  return character;
}

export async function deleteCharacter(
  localId: string
): Promise<void> {
  await characterDatabase.characters.delete(localId);
}