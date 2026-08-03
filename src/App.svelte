<script lang="ts">
  import { onMount } from "svelte";

  import CharacterList from "./lib/components/CharacterList.svelte";
  import CharacterSheet from "./lib/components/CharacterSheet.svelte";

  import { readActorFile } from "./lib/import/read-actor-file";

  import {
    deleteCharacter,
    getAllCharacters,
    saveImportedCharacter,
    saveCharacterPortrait,
  } from "./lib/database/character-repository";

  import type { StoredCharacter } from "./lib/models/stored-character";

  let fileInput: HTMLInputElement;

  let characters: StoredCharacter[] = [];
  let selectedCharacter: StoredCharacter | null = null;

  let errorMessage = "";
  let statusMessage = "";

  let importing = false;
  let loading = true;

  onMount(async () => {
    try {
      await refreshCharacters();
    } catch (error) {
      console.error(error);
      errorMessage = "Stored characters could not be loaded.";
    } finally {
      loading = false;
    }
  });

  async function refreshCharacters(): Promise<void> {
    characters = await getAllCharacters();
  }

  function openFilePicker(): void {
    errorMessage = "";
    statusMessage = "";

    fileInput.click();
  }

  async function handleFileSelection(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    importing = true;
    errorMessage = "";
    statusMessage = "";

    try {
      const imported = await readActorFile(file);

      const saved = await saveImportedCharacter(imported);

      await refreshCharacters();

      statusMessage = `${saved.name} was imported successfully.`;
    } catch (error) {
      console.error(error);

      errorMessage =
        error instanceof Error
          ? error.message
          : "The character could not be imported.";
    } finally {
      importing = false;
      input.value = "";
    }
  }

  function openCharacter(character: StoredCharacter): void {
    selectedCharacter = character;
    errorMessage = "";
    statusMessage = "";
  }

  function closeCharacter(): void {
    selectedCharacter = null;
    errorMessage = "";
    statusMessage = "";
  }

  async function changePortrait(file: File): Promise<void> {
    if (!selectedCharacter) {
      return;
    }

    errorMessage = "";
    statusMessage = "";

    try {
      const portraitDataUrl = await readImageAsDataUrl(file);

      const updated = await saveCharacterPortrait(
        selectedCharacter.localId,
        portraitDataUrl,
      );

      selectedCharacter = updated;
      await refreshCharacters();

      statusMessage = `${updated.name}'s portrait was updated.`;
    } catch (error) {
      console.error(error);

      errorMessage =
        error instanceof Error
          ? error.message
          : "The portrait could not be updated.";
    }
  }

  function readImageAsDataUrl(file: File): Promise<string> {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return Promise.reject(
        new Error("Choose a PNG, JPG, or WebP image."),
      );
    }

    const maximumFileSize = 8 * 1024 * 1024;

    if (file.size > maximumFileSize) {
      return Promise.reject(
        new Error("The portrait image must be 8 MB or smaller."),
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("The portrait image could not be read."));
          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("The portrait image could not be read."));
      };

      reader.readAsDataURL(file);
    });
  }

  async function removeCharacter(character: StoredCharacter): Promise<void> {
    const confirmed = window.confirm(
      `Remove ${character.name} from the character manager?`,
    );

    if (!confirmed) {
      return;
    }

    errorMessage = "";
    statusMessage = "";

    try {
      await deleteCharacter(character.localId);

      if (selectedCharacter?.localId === character.localId) {
        selectedCharacter = null;
      }

      await refreshCharacters();

      statusMessage = `${character.name} was removed.`;
    } catch (error) {
      console.error(error);

      errorMessage = `${character.name} could not be removed.`;
    }
  }
</script>

<svelte:head>
  <title>Morelord Character Manager</title>
</svelte:head>

<div class="app-shell">
  {#if !selectedCharacter}
    <header class="app-header">
      <div class="app-title">
        <h1>Character Manager</h1>
        <p>Offline Foundry D&D character viewer</p>
      </div>

      <button
        type="button"
        class="header-button"
        disabled={importing}
        on:click={openFilePicker}
      >
        {importing ? "Importing…" : "Import Character"}
      </button>

      <input
        bind:this={fileInput}
        class="file-input"
        type="file"
        accept=".json,application/json"
        on:change={handleFileSelection}
      />
    </header>
  {/if}

  <main class:sheet-mode={selectedCharacter !== null}>
    {#if errorMessage}
      <section class="message error-message" role="alert">
        <strong> Something went wrong </strong>

        <p>{errorMessage}</p>
      </section>
    {/if}

    {#if statusMessage}
      <section class="message success-message" role="status">
        <p>{statusMessage}</p>
      </section>
    {/if}

    {#if selectedCharacter}
      <CharacterSheet
        character={selectedCharacter}
        onClose={closeCharacter}
        onPortraitChange={changePortrait}
      />
    {:else}
      <CharacterList
        {characters}
        {loading}
        onOpen={openCharacter}
        onRemove={removeCharacter}
        onImport={openFilePicker}
      />
    {/if}
  </main>
</div>

<style>
  .app-shell {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at top,
        var(--tidy-surface-dark) 0,
        var(--tidy-background) 34rem
      );
    color: var(--tidy-text);
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--tidy-border-gold);
    background: linear-gradient(
      180deg,
      var(--tidy-surface-raised),
      var(--tidy-surface-dark)
    );
    box-shadow: 0 0.35rem 1.1rem var(--tidy-shadow-color);
  }

  .app-title {
    min-width: 0;
  }

  h1,
  p {
    margin-top: 0;
  }

  h1 {
    margin-bottom: 0.2rem;
    color: var(--tidy-text-bright);
    font-family: var(--tidy-font-display);
    font-size: 2rem;
    letter-spacing: 0.025em;
  }

  .app-title p {
    margin-bottom: 0;
    color: var(--tidy-text-muted);
  }

  .header-button {
    flex: 0 0 auto;
    padding: 0.75rem 1.1rem;
    border: 1px solid var(--tidy-proficient);
    border-radius: var(--tidy-radius-medium);
    background: var(--tidy-dark-red);
    color: var(--tidy-text-bright);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .header-button:hover:not(:disabled) {
    background: var(--tidy-proficient);
  }

  .header-button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .file-input {
    display: none;
  }

  main {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 2rem;
  }

  main.sheet-mode {
    width: min(1080px, 100%);
    padding: 0.75rem;
  }

  .message {
    margin-bottom: 1.5rem;
    padding: 1rem 1.25rem;
    border-radius: var(--tidy-radius-medium);
  }

  .message p {
    margin: 0;
  }

  .error-message {
    border: 1px solid var(--tidy-danger-border);
    background: var(--tidy-danger-surface);
  }

  .error-message p {
    margin-top: 0.35rem;
  }

  .success-message {
    border: 1px solid var(--tidy-success-border);
    background: var(--tidy-success-surface);
  }

  @media (max-width: 600px) {
    .app-header {
      align-items: flex-start;
      padding: 1rem;
    }

    h1 {
      font-size: 1.25rem;
    }

    .app-title p {
      display: none;
    }

    .header-button {
      padding: 0.65rem 0.8rem;
    }

    main,
    main.sheet-mode {
      padding: 0.5rem;
    }
  }
</style>
