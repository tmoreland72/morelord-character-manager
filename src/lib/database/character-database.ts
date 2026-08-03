import Dexie, { type EntityTable } from "dexie";
import type { StoredCharacter } from "../models/stored-character";

export class CharacterDatabase extends Dexie {
  characters!: EntityTable<StoredCharacter, "localId">;

  constructor() {
    super("morelord-character-manager");

    this.version(1).stores({
      characters:
        "localId, foundryActorId, name, importedAt, systemVersion",
    });

    this.version(2).stores({
      characters:
        "localId, foundryActorId, name, importedAt, systemVersion, exportFormatVersion",
    });

    /*
     * Version 3 records can contain the format-3 image library. Assets are not
     * indexed, so the table indexes remain unchanged and existing records are
     * upgraded without a data migration.
     */
    this.version(3).stores({
      characters:
        "localId, foundryActorId, name, importedAt, systemVersion, exportFormatVersion",
    });
  }
}

export const characterDatabase = new CharacterDatabase();
