<script lang="ts">
  import type { StoredCharacter } from "../models/stored-character";

  import { createCharacterSummary } from "../characters/character-summary";

  import {
    deriveCharacterValues,
    formatSignedNumber
  } from "../characters/derived-character";

  import SummaryTab from "./tabs/SummaryTab.svelte";
  import ActionsTab from "./tabs/ActionsTab.svelte";
  import InventoryTab from "./tabs/InventoryTab.svelte";
  import SpellsTab from "./tabs/SpellsTab.svelte";
  import FeaturesTab from "./tabs/FeaturesTab.svelte";
  import BiographyTab from "./tabs/BiographyTab.svelte";
  import DiagnosticsTab from "./tabs/DiagnosticsTab.svelte";

  export let character: StoredCharacter;

  type TabId =
    | "summary"
    | "actions"
    | "inventory"
    | "spells"
    | "features"
    | "biography"
    | "diagnostics";

  interface SheetTab {
    id: TabId;
    label: string;
  }

  const tabs: SheetTab[] = [
    {
      id: "summary",
      label: "Summary"
    },
    {
      id: "actions",
      label: "Actions"
    },
    {
      id: "inventory",
      label: "Inventory"
    },
    {
      id: "spells",
      label: "Spells"
    },
    {
      id: "features",
      label: "Features"
    },
    {
      id: "biography",
      label: "Biography"
    },
    {
      id: "diagnostics",
      label: "Diagnostics"
    }
  ];

  let activeTab: TabId = "summary";

  $: summary =
    createCharacterSummary(character);

  $: derived =
    deriveCharacterValues(
      character.actor
    );

  function selectTab(
    tab: TabId
  ): void {
    activeTab = tab;
  }

  function getInitials(
    name: string
  ): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("");
  }

  function getClassDescription():
    string {
    if (
      summary.classes.length === 0
    ) {
      return "Class information unavailable";
    }

    return summary.classes
      .map(
        (item) =>
          `${item.name} ${item.levels}`
      )
      .join(" / ");
  }

  function getSpeedLabel(): string {
    if (derived.speed === null) {
      return "—";
    }

    return `${derived.speed} ${derived.speedUnits}`;
  }
</script>

<section class="sheet">
  <div class="sheet-header">
    <div class="large-portrait">
      {getInitials(character.name)}
    </div>

    <div class="identity">
      <h2>{character.name}</h2>

      <p>
        {getClassDescription()}
      </p>

      <div class="identity-tags">
        {#if summary.species}
          <span>
            {summary.species}
          </span>
        {/if}

        {#if summary.background}
          <span>
            {summary.background}
          </span>
        {/if}

        {#if summary.totalLevel > 0}
          <span>
            Level {summary.totalLevel}
          </span>
        {/if}
      </div>
    </div>

    <div class="header-stats">
      <div>
        <span class="stat-label">
          Armor Class
        </span>

        <strong>
          {derived.armorClass}
        </strong>
      </div>

      <div>
        <span class="stat-label">
          Proficiency
        </span>

        <strong>
          {formatSignedNumber(
            derived.proficiencyBonus
          )}
        </strong>
      </div>

      <div>
        <span class="stat-label">
          Speed
        </span>

        <strong>
          {getSpeedLabel()}
        </strong>
      </div>
    </div>
  </div>

  <nav
    class="sheet-tabs"
    aria-label="Character sheet sections"
  >
    {#each tabs as tab}
      <button
        type="button"
        class:active={
          activeTab === tab.id
        }
        aria-current={
          activeTab === tab.id
            ? "page"
            : undefined
        }
        on:click={() =>
          selectTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  {#if activeTab === "summary"}
    <SummaryTab
      actor={character.actor}
    />
  {:else if activeTab === "actions"}
    <ActionsTab
      actor={character.actor}
    />
  {:else if activeTab === "inventory"}
    <InventoryTab
      actor={character.actor}
    />
  {:else if activeTab === "spells"}
    <SpellsTab
      actor={character.actor}
    />
  {:else if activeTab === "features"}
    <FeaturesTab
      actor={character.actor}
    />
  {:else if activeTab === "biography"}
    <BiographyTab
      actor={character.actor}
    />
  {:else if activeTab === "diagnostics"}
    <DiagnosticsTab
      actor={character.actor}
    />
  {/if}
</section>

<style>
  h2,
  p {
    margin-top: 0;
  }

  button {
    font: inherit;
  }

  .sheet {
    display: grid;
    gap: 1rem;
  }

  .sheet-header {
    display: grid;
    grid-template-columns:
      auto
      1fr
      auto;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
  }

  .large-portrait {
    display: grid;
    width: 112px;
    height: 112px;
    flex: 0 0 auto;
    place-items: center;
    border: 2px solid #806c48;
    border-radius: 50%;
    background: #302c26;
    font-size: 2rem;
    font-weight: 700;
  }

  .identity {
    min-width: 0;
  }

  .identity h2 {
    margin-bottom: 0.35rem;
    font-size: 2rem;
    overflow-wrap: anywhere;
  }

  .identity > p {
    margin-bottom: 0.75rem;
    color: #c4bdae;
  }

  .identity-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .identity-tags span {
    padding: 0.25rem 0.55rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    color: #c4bdae;
    font-size: 0.8rem;
  }

  .header-stats {
    display: flex;
    gap: 0.75rem;
  }

  .header-stats > div {
    display: grid;
    min-width: 96px;
    min-height: 82px;
    place-items: center;
    padding: 0.8rem;
    border: 1px solid #514c43;
    border-radius: 0.4rem;
    background: #1d1b18;
    text-align: center;
  }

  .header-stats strong {
    font-size: 1.35rem;
  }

  .stat-label {
    color: #aaa398;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    text-transform: uppercase;
  }

  .sheet-tabs {
    display: flex;
    gap: 0.35rem;
    padding: 0.4rem;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
    overflow-x: auto;
  }

  .sheet-tabs button {
    flex: 0 0 auto;
    padding: 0.65rem 1rem;
    border: 1px solid transparent;
    border-radius: 0.35rem;
    background: transparent;
    color: #aaa398;
    cursor: pointer;
  }

  .sheet-tabs button:hover {
    background: #302c26;
    color: #ece7dc;
  }

  .sheet-tabs button.active {
    border-color: #806c48;
    background: #4d3927;
    color: #ffffff;
  }

  .sheet-tabs button:focus-visible {
    outline: 2px solid #c09a5b;
    outline-offset: 2px;
  }

  @media (max-width: 850px) {
    .sheet-header {
      grid-template-columns:
        auto
        1fr;
    }

    .header-stats {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 600px) {
    .sheet-header {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .large-portrait {
      margin: 0 auto;
    }

    .identity-tags,
    .header-stats {
      justify-content: center;
    }

    .header-stats {
      grid-column: auto;
      flex-wrap: wrap;
    }

    .header-stats > div {
      flex: 1 1 90px;
    }
  }
</style>