import Dexie, { type EntityTable } from "dexie";
import type { StoredCharacter } from "../models/stored-character";

export class CharacterDatabase extends Dexie {
  characters!: EntityTable<StoredCharacter, "localId">;

  constructor() {
    super("morelord-character-manager");

    this.version(1).stores({
      characters:
        "localId, foundryActorId, name, importedAt, systemVersion"
    });
  }
}

export const characterDatabase = new CharacterDatabase();