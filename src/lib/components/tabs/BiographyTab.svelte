<script lang="ts">
  import TidyIcon from "../TidyIcon.svelte";
  import type { TidyIcon as TidyIconDefinition } from "../../icons/tidy-icons";
  import { appearanceIcon, bondsIcon, characteristicsIcon, flawsIcon, idealsIcon, personalityIcon, publicBiographyIcon } from "../../icons/tidy-icons";
  import type { FoundryActor } from "../../models/foundry-actor";
  import { getPathValue } from "../../characters/actor-values";

  export let actor: FoundryActor;

  interface BiographySection {
    id: string;
    label: string;
    icon: TidyIconDefinition;
    value: string;
  }

  interface Characteristic {
    label: string;
    value: string;
  }

  const detailPaths = {
    appearance: "system.details.appearance",
    publicBiography: "system.details.biography.public",
    personalityTraits: "system.details.trait",
    ideals: "system.details.ideal",
    bonds: "system.details.bond",
    flaws: "system.details.flaw"
  } as const;

  const characteristicPaths = [
    ["Alignment", "system.details.alignment"],
    ["Gender", "system.details.gender"],
    ["Age", "system.details.age"],
    ["Height", "system.details.height"],
    ["Weight", "system.details.weight"],
    ["Eyes", "system.details.eyes"],
    ["Skin", "system.details.skin"],
    ["Hair", "system.details.hair"],
    ["Faith", "system.details.faith"]
  ] as const;

  $: sections = buildSections();
  $: characteristics = buildCharacteristics();
  $: hasBiography =
    sections.length > 0 ||
    characteristics.length > 0;

  function readText(path: string): string {
    // CharacterSheet passes the raw Foundry Actor. The fallback also allows
    // this component to tolerate a wrapped object during development.
    const actorValue = getPathValue(actor, path);
    const wrappedValue = getPathValue(actor, `actor.${path}`);
    const value = actorValue ?? wrappedValue;

    if (typeof value === "string") {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }

    return "";
  }

  function buildSections(): BiographySection[] {
    const candidates: BiographySection[] = [
      {
        id: "appearance",
        label: "Appearance",
        icon: appearanceIcon,
        value: readText(detailPaths.appearance)
      },
      {
        id: "public-biography",
        label: "Public Biography",
        icon: publicBiographyIcon,
        value: readText(detailPaths.publicBiography)
      },
      {
        id: "personality-traits",
        label: "Personality Traits",
        icon: personalityIcon,
        value: readText(detailPaths.personalityTraits)
      },
      {
        id: "ideals",
        label: "Ideals",
        icon: idealsIcon,
        value: readText(detailPaths.ideals)
      },
      {
        id: "bonds",
        label: "Bonds",
        icon: bondsIcon,
        value: readText(detailPaths.bonds)
      },
      {
        id: "flaws",
        label: "Flaws",
        icon: flawsIcon,
        value: readText(detailPaths.flaws)
      }
    ];

    return candidates.filter(
      (section) => section.value.length > 0
    );
  }

  function buildCharacteristics(): Characteristic[] {
    return characteristicPaths
      .map(([label, path]) => ({
        label,
        value: readText(path)
      }))
      .filter(
        (entry) => entry.value.length > 0
      );
  }

  function isWideSection(id: string): boolean {
    return (
      id === "appearance" ||
      id === "public-biography"
    );
  }
</script>

<section class="biography-tab">
  {#if hasBiography}
    {#each sections.filter((section) => isWideSection(section.id)) as section}
      <article class="biography-section biography-section--wide">
        <header class="biography-heading">
          <h2>
            <span class="biography-heading-icon" aria-hidden="true">
              <TidyIcon icon={section.icon} />
            </span>
            {section.label}
          </h2>
        </header>

        <div class="biography-copy">
          {@html section.value}
        </div>
      </article>
    {/each}

    <div class="biography-columns">
      <div class="biography-narrative-column">
        {#each sections.filter((section) => !isWideSection(section.id)) as section}
          <article class="biography-section">
            <header class="biography-heading">
              <h2>
                <span class="biography-heading-icon" aria-hidden="true">
                  <TidyIcon icon={section.icon} />
                </span>
                {section.label}
              </h2>
            </header>

            <div class="biography-copy">
              {@html section.value}
            </div>
          </article>
        {/each}
      </div>

      {#if characteristics.length > 0}
        <article class="biography-section biography-characteristics">
          <header class="biography-heading">
            <h2>
              <span class="biography-heading-icon" aria-hidden="true">
                <TidyIcon icon={characteristicsIcon} />
              </span>
              Characteristics
            </h2>
          </header>

          <dl class="characteristics-list">
            {#each characteristics as characteristic}
              <div class="characteristic-row">
                <dt>{characteristic.label}</dt>
                <dd>{characteristic.value}</dd>
              </div>
            {/each}
          </dl>
        </article>
      {/if}
    </div>
  {:else}
    <div class="biography-empty">
      No populated biography fields were found in this character export.
    </div>
  {/if}
</section>
