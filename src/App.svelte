<script lang="ts">
  import { onMount } from "svelte";

  import CharacterList from "./lib/components/CharacterList.svelte";
  import CharacterSheet from "./lib/components/CharacterSheet.svelte";

  import { readActorFile } from "./lib/import/read-actor-file";

  import {
    deleteCharacter,
    getAllCharacters,
    saveImportedCharacter
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

  async function handleFileSelection(
    event: Event
  ): Promise<void> {
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

      const saved = await saveImportedCharacter(
        imported.actor,
        imported.fileName
      );

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

      // Reset the input so the same file can be selected again.
      input.value = "";
    }
  }

  function openCharacter(
    character: StoredCharacter
  ): void {
    selectedCharacter = character;
    errorMessage = "";
    statusMessage = "";
  }

  function closeCharacter(): void {
    selectedCharacter = null;
    errorMessage = "";
    statusMessage = "";
  }

  async function removeCharacter(
    character: StoredCharacter
  ): Promise<void> {
    const confirmed = window.confirm(
      `Remove ${character.name} from the character manager?`
    );

    if (!confirmed) {
      return;
    }

    errorMessage = "";
    statusMessage = "";

    try {
      await deleteCharacter(character.localId);

      if (
        selectedCharacter?.localId === character.localId
      ) {
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
  <header class="app-header">
    <div class="app-title">
      <h1>Character Manager</h1>
      <p>Offline Foundry D&D character viewer</p>
    </div>

    {#if selectedCharacter}
      <button
        type="button"
        class="header-button secondary-button"
        on:click={closeCharacter}
      >
        Back to Characters
      </button>
    {:else}
      <button
        type="button"
        class="header-button"
        disabled={importing}
        on:click={openFilePicker}
      >
        {importing ? "Importing…" : "Import Character"}
      </button>
    {/if}

    <input
      bind:this={fileInput}
      class="file-input"
      type="file"
      accept=".json,application/json"
      on:change={handleFileSelection}
    />
  </header>

  <main>
    {#if errorMessage}
      <section
        class="message error-message"
        role="alert"
      >
        <strong>Something went wrong</strong>
        <p>{errorMessage}</p>
      </section>
    {/if}

    {#if statusMessage}
      <section
        class="message success-message"
        role="status"
      >
        <p>{statusMessage}</p>
      </section>
    {/if}

    {#if selectedCharacter}
      <CharacterSheet
        character={selectedCharacter}
      />
    {:else}
      <CharacterList
        characters={characters}
        loading={loading}
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
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid #3d3932;
    background: #24211d;
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
    font-size: 1.6rem;
  }

  .app-title p {
    margin-bottom: 0;
    color: #aaa398;
  }

  .header-button {
    flex: 0 0 auto;
    padding: 0.75rem 1.1rem;
    border: 1px solid #806c48;
    border-radius: 0.35rem;
    background: #4d3927;
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .header-button:hover:not(:disabled) {
    background: #624a34;
  }

  .header-button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .secondary-button {
    background: #33302b;
  }

  .file-input {
    display: none;
  }

  main {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 2rem;
  }

  .message {
    margin-bottom: 1.5rem;
    padding: 1rem 1.25rem;
    border-radius: 0.4rem;
  }

  .message p {
    margin: 0;
  }

  .error-message {
    border: 1px solid #954c4c;
    background: #3a2020;
  }

  .error-message p {
    margin-top: 0.35rem;
  }

  .success-message {
    border: 1px solid #537a52;
    background: #203421;
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

    main {
      padding: 1rem;
    }
  }
</style>