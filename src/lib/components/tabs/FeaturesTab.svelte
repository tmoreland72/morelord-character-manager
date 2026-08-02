<script lang="ts">
  import type {
    FoundryActor,
    FoundryActorItem
  } from "../../models/foundry-actor";

  export let actor: FoundryActor;

  type UnknownRecord = Record<string, unknown>;

  interface FeatureGroup {
    id: string;
    label: string;
    items: FoundryActorItem[];
  }

  const featureTypes = [
    "class",
    "subclass",
    "race",
    "species",
    "background",
    "feat"
  ];

  const groupOrder = [
    "class",
    "subclass",
    "race",
    "species",
    "background",
    "feat"
  ];

  const groupLabels: Record<string, string> = {
    class: "Classes",
    subclass: "Subclasses",
    race: "Species",
    species: "Species",
    background: "Background",
    feat: "Features"
  };

  const featureCategoryLabels: Record<string, string> = {
    class: "Class Feature",
    race: "Species Feature",
    species: "Species Feature",
    background: "Background Feature",
    feat: "Feat",
    origin: "Origin Feat",
    general: "General Feat",
    fightingStyle: "Fighting Style",
    epicBoon: "Epic Boon"
  };

  $: features = actor.items
    .filter((item) => featureTypes.includes(item.type))
    .sort(sortFeatures);

  $: groups = createGroups(features);

  function isRecord(value: unknown): value is UnknownRecord {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  function asNumber(value: unknown): number | undefined {
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

  function asString(value: unknown): string | undefined {
    return typeof value === "string"
      ? value
      : undefined;
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

  function sortFeatures(
    left: FoundryActorItem,
    right: FoundryActorItem
  ): number {
    const leftIndex = groupOrder.indexOf(left.type);
    const rightIndex = groupOrder.indexOf(right.type);

    const normalizedLeft =
      leftIndex === -1
        ? groupOrder.length
        : leftIndex;

    const normalizedRight =
      rightIndex === -1
        ? groupOrder.length
        : rightIndex;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    const leftLevel = getFeatureLevel(left) ?? 0;
    const rightLevel = getFeatureLevel(right) ?? 0;

    if (leftLevel !== rightLevel) {
      return leftLevel - rightLevel;
    }

    return left.name.localeCompare(right.name);
  }

  function createGroups(
    items: FoundryActorItem[]
  ): FeatureGroup[] {
    const groups: FeatureGroup[] = [];

    for (const type of groupOrder) {
      const groupedItems = items.filter(
        (item) => item.type === type
      );

      if (groupedItems.length === 0) {
        continue;
      }

      if (
        (type === "race" || type === "species") &&
        groups.some(
          (group) => group.id === "species"
        )
      ) {
        const speciesGroup = groups.find(
          (group) => group.id === "species"
        );

        speciesGroup?.items.push(...groupedItems);
        continue;
      }

      groups.push({
        id:
          type === "race" || type === "species"
            ? "species"
            : type,
        label: groupLabels[type] ?? formatLabel(type),
        items: groupedItems
      });
    }

    return groups;
  }

  function getFeatureLevel(
    item: FoundryActorItem
  ): number | undefined {
    if (item.type === "class") {
      return asNumber(item.system?.levels);
    }

    return asNumber(
      getNestedValue(
        item.system,
        "prerequisites",
        "level"
      )
    );
  }

  function getClassLevels(
    item: FoundryActorItem
  ): number | undefined {
    if (item.type !== "class") {
      return undefined;
    }

    return asNumber(item.system?.levels);
  }

  function getHitDie(
    item: FoundryActorItem
  ): string | undefined {
    if (item.type !== "class") {
      return undefined;
    }

    return asString(
      getNestedValue(
        item.system,
        "hd",
        "denomination"
      )
    );
  }

  function getSpentHitDice(
    item: FoundryActorItem
  ): number | undefined {
    if (item.type !== "class") {
      return undefined;
    }

    return asNumber(
      getNestedValue(
        item.system,
        "hd",
        "spent"
      )
    );
  }

  function getSpellcastingProgression(
    item: FoundryActorItem
  ): string | undefined {
    if (item.type !== "class") {
      return undefined;
    }

    const progression = asString(
      getNestedValue(
        item.system,
        "spellcasting",
        "progression"
      )
    );

    if (!progression || progression === "none") {
      return undefined;
    }

    return formatLabel(progression);
  }

  function getPrimaryAbilities(
    item: FoundryActorItem
  ): string[] {
    const abilities = getNestedValue(
      item.system,
      "primaryAbility",
      "value"
    );

    if (!Array.isArray(abilities)) {
      return [];
    }

    return abilities
      .filter(
        (value): value is string =>
          typeof value === "string"
      )
      .map((ability) =>
        ability.toUpperCase()
      );
  }

  function getFeatureCategory(
    item: FoundryActorItem
  ): string {
    if (item.type !== "feat") {
      return groupLabels[item.type] ?? formatLabel(item.type);
    }

    const category = asString(
      getNestedValue(
        item.system,
        "type",
        "value"
      )
    );

    if (!category) {
      return "Feature";
    }

    return (
      featureCategoryLabels[category] ??
      formatLabel(category)
    );
  }

  function getFeatureSubtype(
    item: FoundryActorItem
  ): string | undefined {
    const subtype = asString(
      getNestedValue(
        item.system,
        "type",
        "subtype"
      )
    );

    return subtype
      ? formatLabel(subtype)
      : undefined;
  }

  function getUsesLabel(
    item: FoundryActorItem
  ): string | undefined {
    const maxValue = getNestedValue(
      item.system,
      "uses",
      "max"
    );

    const spent =
      asNumber(
        getNestedValue(
          item.system,
          "uses",
          "spent"
        )
      ) ?? 0;

    const max = asNumber(maxValue);

    if (
      max === undefined ||
      max <= 0
    ) {
      return undefined;
    }

    const remaining = Math.max(0, max - spent);

    return `${remaining} / ${max}`;
  }

  function getRecoveryLabels(
    item: FoundryActorItem
  ): string[] {
    const recovery = getNestedValue(
      item.system,
      "uses",
      "recovery"
    );

    if (!Array.isArray(recovery)) {
      return [];
    }

    return recovery
      .map((entry) => {
        if (!isRecord(entry)) {
          return undefined;
        }

        const period =
          asString(entry.period) ??
          asString(entry.type);

        return period
          ? formatRecovery(period)
          : undefined;
      })
      .filter(
        (value): value is string =>
          typeof value === "string"
      );
  }

  function getRequirements(
    item: FoundryActorItem
  ): string | undefined {
    const requirements = asString(
      item.system?.requirements
    );

    return requirements?.trim()
      ? requirements
      : undefined;
  }

  function getSourceRules(
    item: FoundryActorItem
  ): string | undefined {
    const rules = asString(
      getNestedValue(
        item.system,
        "source",
        "rules"
      )
    );

    return rules
      ? `${rules} rules`
      : undefined;
  }

  function getIdentifier(
    item: FoundryActorItem
  ): string | undefined {
    return asString(item.system?.identifier);
  }

  function getItemDetails(
    item: FoundryActorItem
  ): string[] {
    const details: string[] = [];

    const levels = getClassLevels(item);
    const hitDie = getHitDie(item);
    const spentHitDice = getSpentHitDice(item);
    const spellcasting = getSpellcastingProgression(item);
    const primaryAbilities = getPrimaryAbilities(item);
    const level = getFeatureLevel(item);
    const subtype = getFeatureSubtype(item);
    const requirements = getRequirements(item);
    const sourceRules = getSourceRules(item);

    if (levels !== undefined) {
      details.push(
        `${levels} ${levels === 1 ? "level" : "levels"}`
      );
    }

    if (hitDie) {
      let hitDieLabel = `Hit Die ${hitDie}`;

      if (
        spentHitDice !== undefined &&
        spentHitDice > 0
      ) {
        hitDieLabel += `, ${spentHitDice} spent`;
      }

      details.push(hitDieLabel);
    }

    if (primaryAbilities.length > 0) {
      details.push(
        `Primary: ${primaryAbilities.join(", ")}`
      );
    }

    if (spellcasting) {
      details.push(
        `${spellcasting} spellcasting`
      );
    }

    if (
      item.type !== "class" &&
      level !== undefined &&
      level > 0
    ) {
      details.push(`Level ${level}`);
    }

    if (subtype) {
      details.push(subtype);
    }

    if (requirements) {
      details.push(requirements);
    }

    if (sourceRules) {
      details.push(sourceRules);
    }

    return details;
  }

  function formatRecovery(value: string): string {
    const labels: Record<string, string> = {
      sr: "Short Rest",
      lr: "Long Rest",
      day: "Daily",
      dawn: "Dawn",
      dusk: "Dusk",
      charges: "Charges",
      turn: "Turn"
    };

    return labels[value] ?? formatLabel(value);
  }

  function formatLabel(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  }

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
</script>

<section class="tab-panel">
  <div class="panel-heading">
    <div>
      <h3>Features</h3>

      <p>
        Classes, species, background, feats,
        and other character features.
      </p>
    </div>

    <span class="count-badge">
      {features.length}
    </span>
  </div>

  {#if features.length === 0}
    <div class="empty-state">
      No character features were found.
    </div>
  {:else}
    <div class="feature-groups">
      {#each groups as group}
        <section class="feature-group">
          <header class="group-heading">
            <h4>{group.label}</h4>

            <span>{group.items.length}</span>
          </header>

          <div class="feature-list">
            {#each group.items as feature}
              {@const details = getItemDetails(feature)}
              {@const uses = getUsesLabel(feature)}
              {@const recovery = getRecoveryLabels(feature)}

              <article class="feature-row">
                <div class="feature-icon">
                  {getInitial(feature.name)}
                </div>

                <div class="feature-information">
                  <div class="feature-title-row">
                    <strong>{feature.name}</strong>

                    <span class="category">
                      {getFeatureCategory(feature)}
                    </span>
                  </div>

                  {#if getIdentifier(feature)}
                    <small class="identifier">
                      {getIdentifier(feature)}
                    </small>
                  {/if}

                  {#if details.length > 0}
                    <div class="feature-details">
                      {#each details as detail}
                        <span>{detail}</span>
                      {/each}
                    </div>
                  {/if}
                </div>

                <div class="feature-status">
                  {#if uses}
                    <span class="uses">
                      Uses {uses}
                    </span>
                  {/if}

                  {#if recovery.length > 0}
                    {#each recovery as recoveryLabel}
                      <span class="recovery">
                        {recoveryLabel}
                      </span>
                    {/each}
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</section>

<style>
  h3,
  h4,
  p {
    margin-top: 0;
  }

  .tab-panel {
    padding: 1.25rem;
    border: 1px solid #454038;
    border-radius: 0.5rem;
    background: #24211d;
  }

  .panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .panel-heading h3 {
    margin-bottom: 0.25rem;
  }

  .panel-heading p {
    margin-bottom: 0;
    color: #aaa398;
  }

  .count-badge {
    min-width: 2.25rem;
    padding: 0.35rem 0.65rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    background: #1d1b18;
    text-align: center;
  }

  .feature-groups {
    display: grid;
    gap: 1rem;
  }

  .feature-group {
    overflow: hidden;
    border: 1px solid #454038;
    border-radius: 0.4rem;
  }

  .group-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 0.85rem;
    background: #302c26;
  }

  .group-heading h4 {
    margin-bottom: 0;
  }

  .group-heading > span {
    display: grid;
    min-width: 1.8rem;
    height: 1.8rem;
    place-items: center;
    border-radius: 999px;
    background: #1d1b18;
    color: #aaa398;
    font-size: 0.8rem;
  }

  .feature-list {
    background: #1d1b18;
  }

  .feature-row {
    display: grid;
    grid-template-columns:
      auto
      minmax(220px, 1fr)
      auto;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.85rem;
    border-bottom: 1px solid #454038;
  }

  .feature-row:last-child {
    border-bottom: 0;
  }

  .feature-row:nth-child(even) {
    background: #211f1b;
  }

  .feature-icon {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border: 1px solid #514c43;
    border-radius: 0.3rem;
    background: #181714;
    font-weight: 700;
  }

  .feature-information {
    min-width: 0;
  }

  .feature-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  .feature-title-row strong {
    overflow-wrap: anywhere;
  }

  .category {
    padding: 0.15rem 0.4rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    color: #aaa398;
    font-size: 0.68rem;
  }

  .identifier {
    display: block;
    margin-top: 0.2rem;
    color: #777168;
    font-family: monospace;
  }

  .feature-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.7rem;
    margin-top: 0.4rem;
    color: #aaa398;
    font-size: 0.75rem;
  }

  .feature-details span {
    position: relative;
  }

  .feature-details span:not(:last-child)::after {
    position: absolute;
    right: -0.45rem;
    content: "•";
    color: #5f594f;
  }

  .feature-status {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.3rem;
    max-width: 190px;
  }

  .uses,
  .recovery {
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    font-size: 0.7rem;
  }

  .uses {
    border: 1px solid #806c48;
    background: #3d3020;
    color: #e2c289;
  }

  .recovery {
    border: 1px solid #537a52;
    background: #203421;
    color: #bad5b9;
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed #514c43;
    border-radius: 0.4rem;
    color: #aaa398;
    text-align: center;
  }

  @media (max-width: 700px) {
    .feature-row {
      grid-template-columns:
        auto
        minmax(0, 1fr);
    }

    .feature-status {
      grid-column: 2;
      justify-content: flex-start;
      max-width: none;
    }
  }

  @media (max-width: 500px) {
    .panel-heading {
      flex-direction: column;
    }

    .feature-icon {
      width: 36px;
      height: 36px;
    }
  }
</style>