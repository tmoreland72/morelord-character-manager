<script lang="ts">
  import TidyIcon from "../TidyIcon.svelte";
  import type { TidyIcon as TidyIconDefinition } from "../../icons/tidy-icons";
  import { armorIcon, arrowRightIcon, languagesIcon, proficiencyFullIcon, proficiencyHalfIcon, proficiencyNoneIcon, savingThrowsIcon, sizeIcon, skillsIcon, specialTraitsIcon, toolsIcon, weaponsIcon } from "../../icons/tidy-icons";
  import type {
    FoundryActorItem
  } from "../../models/foundry-actor";

  import type {
    StoredCharacter
  } from "../../models/stored-character";

  import {
    getItemImageSrc
  } from "../../assets/image-resolver";

  import ItemDetailsDialog from "../ItemDetailsDialog.svelte";

  import {
    deriveCharacterValues,
    formatSignedNumber
  } from "../../characters/derived-character";

  export let character: StoredCharacter;

  let selectedItem: FoundryActorItem | null = null;

  $: actor = character.actor;

  type UnknownRecord = Record<string, unknown>;

  interface TraitRow {
    label: string;
    icon: TidyIconDefinition;
    values: string[];
  }

  const abilityLabels: Record<string, string> = {
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA"
  };

  $: derived = deriveCharacterValues(actor);

  $: classes = actor.items
    .filter((item) => item.type === "class")
    .sort((left, right) =>
      left.name.localeCompare(right.name)
    );

  $: species = actor.items.find(
    (item) =>
      item.type === "race" ||
      item.type === "species"
  );

  $: background = actor.items.find(
    (item) => item.type === "background"
  );

  $: tools = actor.items
    .filter((item) => item.type === "tool")
    .sort((left, right) =>
      left.name.localeCompare(right.name)
    );

  $: traitRows = createTraitRows();

  function isRecord(
    value: unknown
  ): value is UnknownRecord {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  function asString(
    value: unknown
  ): string | undefined {
    return typeof value === "string"
      ? value
      : undefined;
  }

  function asNumber(
    value: unknown
  ): number | undefined {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  function getNestedValue(
    source: unknown,
    ...keys: string[]
  ): unknown {
    let current = source;

    for (const key of keys) {
      if (!isRecord(current)) {
        return undefined;
      }

      current = current[key];
    }

    return current;
  }

  function getArrayOfStrings(
    value: unknown
  ): string[] {
    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is string =>
          typeof entry === "string" &&
          entry.trim().length > 0
      );
    }

    if (isRecord(value)) {
      return Object.entries(value)
        .filter(([, enabled]) =>
          enabled === true ||
          enabled === 1
        )
        .map(([key]) => key);
    }

    return [];
  }

  function getTraitValues(
    traitName: string
  ): string[] {
    const trait = getNestedValue(
      actor.system,
      "traits",
      traitName
    );

    if (!isRecord(trait)) {
      return getArrayOfStrings(trait)
        .map(formatLabel);
    }

    const values = getArrayOfStrings(
      trait.value
    );

    const custom = asString(
      trait.custom
    )
      ?.split(/[;,]/)
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

    return [...values, ...custom]
      .map(formatLabel)
      .filter(
        (value, index, collection) =>
          collection.indexOf(value) === index
      );
  }

  function getSizeLabel(): string {
    const value = asString(
      getNestedValue(
        actor.system,
        "traits",
        "size"
      )
    );

    const labels: Record<string, string> = {
      tiny: "Tiny",
      sm: "Small",
      med: "Medium",
      lg: "Large",
      huge: "Huge",
      grg: "Gargantuan"
    };

    return value
      ? labels[value] ?? formatLabel(value)
      : "—";
  }

  function getCreatureType(): string {
    const value = asString(
      getNestedValue(
        species?.system,
        "type",
        "value"
      )
    );

    const subtype = asString(
      getNestedValue(
        species?.system,
        "type",
        "subtype"
      )
    );

    if (value && subtype) {
      return `${formatLabel(value)} ${formatLabel(subtype)}`;
    }

    return formatLabel(
      value || subtype || "Humanoid"
    );
  }

  function getClassLevel(
    item: FoundryActorItem
  ): number {
    return asNumber(
      item.system?.levels
    ) ?? 0;
  }

  function getSpeedLabel(): string {
    if (derived.speed === null) {
      return "—";
    }

    return `Speed ${derived.speed} ${derived.speedUnits}`;
  }

  function createTraitRows():
    TraitRow[] {
    return [
      {
        label: "Size",
        icon: sizeIcon,
        values: [getSizeLabel()]
      },
      {
        label: "Speed",
        icon: arrowRightIcon,
        values: [getSpeedLabel()]
      },
      {
        label: "Armor",
        icon: armorIcon,
        values: getTraitValues(
          "armorProf"
        )
      },
      {
        label: "Weapons",
        icon: weaponsIcon,
        values: getTraitValues(
          "weaponProf"
        )
      },
      {
        label: "Languages",
        icon: languagesIcon,
        values: getTraitValues(
          "languages"
        )
      }
    ];
  }

  function getToolAbility(
    item: FoundryActorItem
  ): string {
    const ability = asString(
      item.system?.ability
    );

    if (ability) {
      return ability.toUpperCase();
    }

    const activity = getFirstActivity(
      item
    );

    const activityAbility = asString(
      getNestedValue(
        activity,
        "check",
        "ability"
      )
    );

    return activityAbility
      ? activityAbility.toUpperCase()
      : "—";
  }

  function getToolModifier(
    item: FoundryActorItem
  ): number {
    const ability =
      getToolAbility(item).toLowerCase();

    const skill = derived.skills.find(
      (entry) =>
        entry.ability === ability
    );

    const proficiency =
      asNumber(
        item.system?.proficient
      ) ?? 1;

    const baseModifier =
      getAbilityModifierFromDerived(
        ability
      );

    return (
      baseModifier +
      derived.proficiencyBonus *
        proficiency
    );
  }

  function getAbilityModifierFromDerived(
    ability: string
  ): number {
    const save =
      derived.savingThrows.find(
        (entry) =>
          entry.ability === ability
      );

    if (!save) {
      return 0;
    }

    const proficientBonus =
      save.proficient
        ? derived.proficiencyBonus
        : 0;

    return (
      save.modifier -
      proficientBonus
    );
  }

  function getFirstActivity(
    item: FoundryActorItem
  ): unknown {
    const activities =
      item.system?.activities;

    if (!isRecord(activities)) {
      return undefined;
    }

    return Object.values(
      activities
    )[0];
  }

  function getProficiencyIcon(
    proficiency: number
  ): TidyIconDefinition {
    if (proficiency >= 2) {
      return specialTraitsIcon;
    }

    if (proficiency >= 1) {
      return proficiencyFullIcon;
    }

    if (proficiency > 0) {
      return proficiencyHalfIcon;
    }

    return proficiencyNoneIcon;
  }

  function formatLabel(
    value: string
  ): string {
    return value
      .replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      )
      .replace(/[_-]+/g, " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  }
</script>

<div class="character-tab">
  <aside class="left-column">
    <section class="tidy-panel skills-panel">
      <header class="panel-header">
        <div>
          <span class="header-icon">
            <TidyIcon icon={skillsIcon} />
          </span>

          <h3>Skills</h3>
        </div>

        <span>
          Modifier / Passive
        </span>
      </header>

      <div class="skill-list">
        {#each derived.skills as skill}
          <div class="skill-row">
            <span
              class:trained={
                skill.proficiency > 0
              }
              class:expert={
                skill.proficiency >= 2
              }
              class="proficiency-marker"
            >
              <TidyIcon icon={getProficiencyIcon(skill.proficiency)} />
            </span>

            <span class="skill-ability">
              {abilityLabels[
                skill.ability
              ] ??
                skill.ability.toUpperCase()}
            </span>

            <strong class="skill-name">
              {skill.name}
            </strong>

            <span class="skill-modifier">
              {formatSignedNumber(
                skill.modifier
              )}
            </span>

            <span class="skill-passive">
              {skill.passive}
            </span>
          </div>
        {/each}
      </div>
    </section>

    <section class="tidy-panel tools-panel">
      <header class="panel-header">
        <div>
          <span class="header-icon">
            <TidyIcon icon={toolsIcon} />
          </span>

          <h3>Tools</h3>
        </div>

        <span>Modifier</span>
      </header>

      {#if tools.length === 0}
        <div class="empty-row">
          No tool proficiencies
        </div>
      {:else}
        <div class="tool-list">
          {#each tools as tool}
            <div class="tool-row detail-trigger" role="button" tabindex="0" on:click={() => selectedItem = tool} on:keydown={(event) => { if (event.key === "Enter" || event.key === " ") selectedItem = tool; }}>
              <span class="proficiency-marker trained">
                <TidyIcon icon={proficiencyFullIcon} />
              </span>

              <span class="tool-item-image">
                {#if getItemImageSrc(character, tool)}
                  <img
                    src={getItemImageSrc(character, tool)}
                    alt=""
                  />
                {:else}
                  {tool.name.charAt(0).toUpperCase()}
                {/if}
              </span>

              <span class="tool-ability">
                {getToolAbility(tool)}
              </span>

              <strong>
                {tool.name}
              </strong>

              <span class="tool-modifier">
                {formatSignedNumber(
                  getToolModifier(tool)
                )}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </aside>

  <div class="right-column">
    <section class="tidy-panel saves-panel">
      <header class="panel-header">
        <div>
          <span class="header-icon">
            <TidyIcon icon={savingThrowsIcon} />
          </span>

          <h3>Saving Throws</h3>
        </div>

        <span>Modifier</span>
      </header>

      <div class="save-grid">
        {#each derived.savingThrows as save}
          <div class="save-row">
            <span
              class:trained={
                save.proficient
              }
              class="proficiency-marker"
            >
              <TidyIcon icon={save.proficient ? proficiencyFullIcon : proficiencyNoneIcon} />
            </span>

            <strong>
              {save.name}
            </strong>

            <span>
              {formatSignedNumber(
                save.modifier
              )}
            </span>
          </div>
        {/each}
      </div>
    </section>

    <section class="traits-section">
      <header class="traits-heading">
        <h3>Character Traits</h3>

        <button
          type="button"
          disabled
        >
          <TidyIcon icon={specialTraitsIcon} /> Special Traits
        </button>
      </header>

      <div class="trait-list">
        {#each classes as classItem}
          <div class="trait-row">
            <strong class="trait-label">
              Class
            </strong>

            <div class="trait-value detail-trigger" role="button" tabindex="0" on:click={() => selectedItem = classItem} on:keydown={(event) => { if (event.key === "Enter" || event.key === " ") selectedItem = classItem; }}>
              <span class="item-icon">
                {#if getItemImageSrc(character, classItem)}
                  <img
                    src={getItemImageSrc(character, classItem)}
                    alt=""
                  />
                {:else}
                  {classItem.name
                    .charAt(0)
                    .toUpperCase()}
                {/if}
              </span>

              <span class="linked-value">
                {classItem.name}
              </span>

              <span>
                · Level
                {getClassLevel(
                  classItem
                )}
              </span>
            </div>
          </div>
        {/each}

        <div class="trait-row">
          <strong class="trait-label">
            Species
          </strong>

          <div class="trait-value detail-trigger" role="button" tabindex="0" on:click={() => species && (selectedItem = species)} on:keydown={(event) => { if (species && (event.key === "Enter" || event.key === " ")) selectedItem = species; }}>
            {#if species}
              <span class="item-icon">
                {#if getItemImageSrc(character, species)}
                  <img
                    src={getItemImageSrc(character, species)}
                    alt=""
                  />
                {:else}
                  {species.name
                    .charAt(0)
                    .toUpperCase()}
                {/if}
              </span>

              <span class="linked-value">
                {species.name}
              </span>
            {:else}
              <span>—</span>
            {/if}
          </div>
        </div>

        <div class="trait-row">
          <strong class="trait-label">
            Creature Type
          </strong>

          <div class="trait-value">
            <span class="trait-arrow">
              <TidyIcon icon={arrowRightIcon} />
            </span>

            <span>
              {getCreatureType()}
            </span>
          </div>
        </div>

        <div class="trait-row">
          <strong class="trait-label">
            Background
          </strong>

          <div class="trait-value detail-trigger" role="button" tabindex="0" on:click={() => background && (selectedItem = background)} on:keydown={(event) => { if (background && (event.key === "Enter" || event.key === " ")) selectedItem = background; }}>
            {#if background}
              <span class="item-icon">
                {#if getItemImageSrc(character, background)}
                  <img
                    src={getItemImageSrc(character, background)}
                    alt=""
                  />
                {:else}
                  {background.name
                    .charAt(0)
                    .toUpperCase()}
                {/if}
              </span>

              <span class="linked-value">
                {background.name}
              </span>
            {:else}
              <span>—</span>
            {/if}
          </div>
        </div>

        {#each traitRows as row}
          <div class="trait-row">
            <strong class="trait-label">
              <span class="trait-label-icon">
                <TidyIcon icon={row.icon} />
              </span>

              {row.label}
            </strong>

            <div class="trait-value trait-tags">
              {#if row.values.length === 0}
                <span class="muted">
                  None
                </span>
              {:else}
                {#each row.values as value}
                  <span class="trait-tag">
                    {value}
                  </span>
                {/each}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<ItemDetailsDialog {character} item={selectedItem} onClose={() => selectedItem = null} />
