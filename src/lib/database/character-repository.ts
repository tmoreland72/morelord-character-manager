import { characterDatabase } from "./character-database";
import type { ImportedActorFile } from "../import/read-actor-file";
import type { StoredCharacter } from "../models/stored-character";

export async function getAllCharacters(): Promise<StoredCharacter[]> {
  return characterDatabase.characters.orderBy("name").toArray();
}

export async function getCharacter(
  localId: string,
): Promise<StoredCharacter | undefined> {
  return characterDatabase.characters.get(localId);
}

export async function saveImportedCharacter(
  imported: ImportedActorFile,
): Promise<StoredCharacter> {
  const { actor } = imported;

  const existing = actor._id
    ? await characterDatabase.characters
        .where("foundryActorId")
        .equals(actor._id)
        .first()
    : undefined;

  const exportedPortraitData = imported.portrait?.data;
  const preserveCustomPortrait =
    existing?.portraitSource === "custom" &&
    typeof existing.portraitDataUrl === "string";

  const portraitDataUrl = preserveCustomPortrait
    ? existing.portraitDataUrl
    : exportedPortraitData ?? existing?.portraitDataUrl;

  const portraitSource = preserveCustomPortrait
    ? "custom"
    : exportedPortraitData
      ? "export"
      : existing?.portraitSource;

  const portraitAsset = imported.portrait
    ? omitPortraitData(imported.portrait)
    : existing?.portraitAsset;

  const character: StoredCharacter = {
    localId: existing?.localId ?? crypto.randomUUID(),
    foundryActorId: actor._id,
    name: actor.name,
    actorType: actor.type,
    portraitPath: imported.portrait?.path ?? actor.img,
    portraitDataUrl,
    portraitSource,
    portraitAsset,
    sourceFileName: imported.fileName,
    importedAt: new Date().toISOString(),
    exportFormat: imported.exportFormat,
    exportFormatVersion: imported.exportFormatVersion,
    exportedAt: imported.exportedAt,
    exportSource: imported.exportSource,
    foundryVersion:
      imported.exportSource?.foundryVersion ?? actor._stats?.coreVersion,
    systemVersion:
      imported.exportSource?.systemVersion ?? actor._stats?.systemVersion,
    derived: imported.derived,
    assets: imported.assets,
    actor,
  };

  await characterDatabase.characters.put(character);

  return character;
}

export async function saveCharacterPortrait(
  localId: string,
  portraitDataUrl: string,
): Promise<StoredCharacter> {
  const character = await characterDatabase.characters.get(localId);

  if (!character) {
    throw new Error("The character could not be found.");
  }

  const updated: StoredCharacter = {
    ...character,
    portraitDataUrl,
    portraitSource: "custom",
  };

  await characterDatabase.characters.put(updated);

  return updated;
}

export async function deleteCharacter(localId: string): Promise<void> {
  await characterDatabase.characters.delete(localId);
}

function omitPortraitData(
  portrait: NonNullable<ImportedActorFile["portrait"]>,
): NonNullable<StoredCharacter["portraitAsset"]> {
  const { data: _data, ...metadata } = portrait;
  return metadata;
}
