import type { FoundryActor } from "./foundry-actor";

export interface StoredCharacter {
  localId: string;
  foundryActorId?: string;
  name: string;
  actorType: string;
  portraitPath?: string;
  sourceFileName: string;
  importedAt: string;
  foundryVersion?: string;
  systemVersion?: string;
  actor: FoundryActor;
}