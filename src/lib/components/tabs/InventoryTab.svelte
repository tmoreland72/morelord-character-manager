<script lang="ts">
  import type {
    FoundryActor,
    FoundryActorItem
  } from "../../models/foundry-actor";

  export let actor: FoundryActor;

  type UnknownRecord = Record<string, unknown>;

  interface InventoryGroup {
    id: string;
    label: string;
    items: FoundryActorItem[];
  }

  const inventoryTypes = [
    "weapon",
    "equipment",
    "consumable",
    "tool",
    "loot",
    "container"
  ];

  const groupOrder = [
    "weapon",
    "equipment",
    "consumable",
    "tool",
    "container",
    "loot"
  ];

  const groupLabels: Record<string, string> = {
    weapon: "Weapons",
    equipment: "Equipment",
    consumable: "Consumables",
    tool: "Tools",
    container: "Containers",
    loot: "Loot"
  };

  const propertyLabels: Record<string, string> = {
    amm: "Ammunition",
    fin: "Finesse",
    fir: "Firearm",
    foc: "Focus",
    hvy: "Heavy",
    lgt: "Light",
    lod: "Loading",
    mgc: "Magical",
    rch: "Reach",
    rel: "Reload",
    ret: "Returning",
    spc: "Special",
    thr: "Thrown",
    two: "Two-Handed",
    ver: "Versatile"
  };

  const masteryLabels: Record<string, string> = {
    cleave: "Cleave",
    graze: "Graze",
    nick: "Nick",
    push: "Push",
    sap: "Sap",
    slow: "Slow",
    topple: "Topple",
    vex: "Vex"
  };

  $: inventory = actor.items
    .filter((item) => inventoryTypes.includes(item.type))
    .sort(sortInventoryItems);

  $: groups = createGroups(inventory);

  $: itemNamesById = new Map(
    actor.items
      .filter((item) => item._id)
      .map((item) => [item._id as string, item.name])
  );

  $: totalWeight = calculateTotalWeight(inventory);

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

  function sortInventoryItems(
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

    return left.name.localeCompare(right.name);
  }

  function createGroups(
    items: FoundryActorItem[]
  ): InventoryGroup[] {
    return groupOrder
      .map((type) => ({
        id: type,
        label: groupLabels[type] ?? formatType(type),
        items: items.filter((item) => item.type === type)
      }))
      .filter((group) => group.items.length > 0);
  }

  function getQuantity(item: FoundryActorItem): number {
    return asNumber(item.system?.quantity) ?? 1;
  }

  function getWeightValue(
    item: FoundryActorItem
  ): number | undefined {
    return asNumber(
      getNestedValue(
        item.system,
        "weight",
        "value"
      )
    );
  }

  function getWeightUnits(
    item: FoundryActorItem
  ): string {
    return (
      asString(
        getNestedValue(
          item.system,
          "weight",
          "units"
        )
      ) ?? "lb"
    );
  }

  function getWeightLabel(
    item: FoundryActorItem
  ): string {
    const weight = getWeightValue(item);

    if (weight === undefined) {
      return "—";
    }

    return `${formatNumber(weight)} ${getWeightUnits(item)}`;
  }

  function calculateTotalWeight(
    items: FoundryActorItem[]
  ): number {
    return items.reduce((total, item) => {
      const weight = getWeightValue(item) ?? 0;
      const quantity = getQuantity(item);

      return total + weight * quantity;
    }, 0);
  }

  function getPriceLabel(
    item: FoundryActorItem
  ): string {
    const value = asNumber(
      getNestedValue(
        item.system,
        "price",
        "value"
      )
    );

    const denomination =
      asString(
        getNestedValue(
          item.system,
          "price",
          "denomination"
        )
      ) ?? "gp";

    if (value === undefined) {
      return "—";
    }

    return `${formatNumber(value)} ${denomination}`;
  }

  function getItemSubtype(
    item: FoundryActorItem
  ): string {
    const value =
      asString(
        getNestedValue(
          item.system,
          "type",
          "value"
        )
      ) ?? "";

    const subtype =
      asString(
        getNestedValue(
          item.system,
          "type",
          "subtype"
        )
      ) ?? "";

    const baseItem =
      asString(
        getNestedValue(
          item.system,
          "type",
          "baseItem"
        )
      ) ?? "";

    return (
      subtype ||
      value ||
      baseItem ||
      formatType(item.type)
    );
  }

  function getContainerName(
    item: FoundryActorItem
  ): string | undefined {
    const containerId =
      asString(item.system?.container);

    if (!containerId) {
      return undefined;
    }

    return itemNamesById.get(containerId) ?? containerId;
  }

  function getDamageLabel(
    item: FoundryActorItem
  ): string | undefined {
    const number = asNumber(
      getNestedValue(
        item.system,
        "damage",
        "base",
        "number"
      )
    );

    const denomination = asNumber(
      getNestedValue(
        item.system,
        "damage",
        "base",
        "denomination"
      )
    );

    const bonus =
      asString(
        getNestedValue(
          item.system,
          "damage",
          "base",
          "bonus"
        )
      ) ?? "";

    const types = getNestedValue(
      item.system,
      "damage",
      "base",
      "types"
    );

    if (
      number === undefined ||
      denomination === undefined ||
      denomination <= 0
    ) {
      return undefined;
    }

    const formula =
      `${number}d${denomination}${bonus}`;

    const damageTypes = Array.isArray(types)
      ? types
          .filter(
            (value): value is string =>
              typeof value === "string"
          )
          .map(formatType)
          .join(", ")
      : "";

    return damageTypes
      ? `${formula} ${damageTypes}`
      : formula;
  }

  function getRangeLabel(
    item: FoundryActorItem
  ): string | undefined {
    const range = asNumber(
      getNestedValue(
        item.system,
        "range",
        "value"
      )
    );

    const longRange = asNumber(
      getNestedValue(
        item.system,
        "range",
        "long"
      )
    );

    const reach = asNumber(
      getNestedValue(
        item.system,
        "range",
        "reach"
      )
    );

    const units =
      asString(
        getNestedValue(
          item.system,
          "range",
          "units"
        )
      ) ?? "ft";

    if (range !== undefined && longRange !== undefined) {
      return `${range}/${longRange} ${units}`;
    }

    if (range !== undefined) {
      return `${range} ${units}`;
    }

    if (reach !== undefined) {
      return `${reach} ${units}`;
    }

    return undefined;
  }

  function getArmorClassLabel(
    item: FoundryActorItem
  ): string | undefined {
    const armorValue = asNumber(
      getNestedValue(
        item.system,
        "armor",
        "value"
      )
    );

    if (armorValue === undefined) {
      return undefined;
    }

    const dexterityCap = asNumber(
      getNestedValue(
        item.system,
        "armor",
        "dex"
      )
    );

    if (dexterityCap === undefined) {
      return `AC ${armorValue}`;
    }

    return `AC ${armorValue} + Dex (max ${dexterityCap})`;
  }

  function getMasteryLabel(
    item: FoundryActorItem
  ): string | undefined {
    const mastery = asString(item.system?.mastery);

    if (!mastery) {
      return undefined;
    }

    return masteryLabels[mastery] ?? formatType(mastery);
  }

  function getProperties(
    item: FoundryActorItem
  ): string[] {
    const properties = item.system?.properties;

    if (!Array.isArray(properties)) {
      return [];
    }

    return properties
      .filter(
        (value): value is string =>
          typeof value === "string"
      )
      .map(
        (property) =>
          propertyLabels[property] ??
          formatType(property)
      );
  }

  function getItemDetails(
    item: FoundryActorItem
  ): string[] {
    const details: string[] = [];

    const damage = getDamageLabel(item);
    const armorClass = getArmorClassLabel(item);
    const range = getRangeLabel(item);
    const mastery = getMasteryLabel(item);
    const container = getContainerName(item);
    const properties = getProperties(item);

    if (damage) {
      details.push(damage);
    }

    if (armorClass) {
      details.push(armorClass);
    }

    if (range) {
      details.push(`Range ${range}`);
    }

    if (mastery) {
      details.push(`Mastery: ${mastery}`);
    }

    if (properties.length > 0) {
      details.push(properties.join(", "));
    }

    if (container) {
      details.push(`In ${container}`);
    }

    return details;
  }

  function getStatusLabels(
    item: FoundryActorItem
  ): string[] {
    const labels: string[] = [];

    if (item.system?.equipped === true) {
      labels.push("Equipped");
    }

    if (item.system?.attuned === true) {
      labels.push("Attuned");
    }

    if (item.system?.identified === false) {
      labels.push("Unidentified");
    }

    const rarity = asString(item.system?.rarity);

    if (rarity) {
      labels.push(formatType(rarity));
    }

    return labels;
  }

  function formatType(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  }

  function formatNumber(value: number): string {
    return Number.isInteger(value)
      ? `${value}`
      : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
</script>

<section class="tab-panel">
  <div class="panel-heading">
    <div>
      <h3>Inventory</h3>

      <p>
        Weapons, equipment, consumables, tools,
        containers, and loot.
      </p>
    </div>

    <div class="inventory-summary">
      <span>{inventory.length} items</span>
      <span>{formatNumber(totalWeight)} lb</span>
    </div>
  </div>

  {#if inventory.length === 0}
    <div class="empty-state">
      No inventory items were found.
    </div>
  {:else}
    <div class="inventory-groups">
      {#each groups as group}
        <section class="inventory-group">
          <header class="group-heading">
            <h4>{group.label}</h4>
            <span>{group.items.length}</span>
          </header>

          <div class="item-list">
            <div class="item-row item-header">
              <span>Item</span>
              <span>Quantity</span>
              <span>Weight</span>
              <span>Value</span>
            </div>

            {#each group.items as item}
              {@const details = getItemDetails(item)}
              {@const statuses = getStatusLabels(item)}

              <article class="item-row">
                <div class="item-main">
                  <div class="item-icon">
                    {getInitial(item.name)}
                  </div>

                  <div class="item-information">
                    <div class="item-title-row">
                      <strong>{item.name}</strong>

                      {#if statuses.length > 0}
                        <div class="status-list">
                          {#each statuses as status}
                            <span>{status}</span>
                          {/each}
                        </div>
                      {/if}
                    </div>

                    <small class="item-type">
                      {formatType(getItemSubtype(item))}
                    </small>

                    {#if details.length > 0}
                      <div class="item-details">
                        {#each details as detail}
                          <span>{detail}</span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>

                <span class="quantity">
                  {getQuantity(item)}
                </span>

                <span class="weight">
                  {getWeightLabel(item)}
                </span>

                <span class="price">
                  {getPriceLabel(item)}
                </span>
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

  .inventory-summary {
    display: flex;
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .inventory-summary span {
    padding: 0.35rem 0.65rem;
    border: 1px solid #514c43;
    border-radius: 999px;
    background: #1d1b18;
    color: #c4bdae;
    font-size: 0.8rem;
  }

  .inventory-groups {
    display: grid;
    gap: 1rem;
  }

  .inventory-group {
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

  .item-list {
    background: #1d1b18;
  }

  .item-row {
    display: grid;
    grid-template-columns:
      minmax(300px, 1fr)
      80px
      100px
      100px;
    align-items: center;
    gap: 1rem;
    min-height: 64px;
    padding: 0.75rem 0.85rem;
    border-bottom: 1px solid #454038;
  }

  .item-row:last-child {
    border-bottom: 0;
  }

  .item-row:nth-child(odd):not(.item-header) {
    background: #211f1b;
  }

  .item-header {
    min-height: auto;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background: #28241f;
    color: #8f887d;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .item-main {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 0;
  }

  .item-icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    place-items: center;
    border: 1px solid #514c43;
    border-radius: 0.3rem;
    background: #181714;
    font-weight: 700;
  }

  .item-information {
    min-width: 0;
  }

  .item-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  .item-title-row strong {
    overflow-wrap: anywhere;
  }

  .item-type {
    display: block;
    margin-top: 0.15rem;
    color: #8f887d;
  }

  .status-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .status-list span {
    padding: 0.15rem 0.4rem;
    border: 1px solid #806c48;
    border-radius: 999px;
    background: #3d3020;
    color: #e2c289;
    font-size: 0.68rem;
  }

  .item-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.65rem;
    margin-top: 0.35rem;
    color: #aaa398;
    font-size: 0.75rem;
  }

  .item-details span {
    position: relative;
  }

  .item-details span:not(:last-child)::after {
    position: absolute;
    right: -0.42rem;
    content: "•";
    color: #5f594f;
  }

  .quantity,
  .weight,
  .price {
    color: #c4bdae;
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed #514c43;
    border-radius: 0.4rem;
    color: #aaa398;
    text-align: center;
  }

  @media (max-width: 800px) {
    .item-row {
      grid-template-columns:
        minmax(240px, 1fr)
        70px
        90px;
    }

    .item-header span:last-child,
    .price {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .panel-heading {
      flex-direction: column;
    }

    .inventory-summary {
      flex-wrap: wrap;
    }

    .item-header {
      display: none;
    }

    .item-row {
      grid-template-columns: 1fr auto;
      gap: 0.75rem;
    }

    .quantity::before {
      content: "Qty ";
      color: #8f887d;
    }

    .weight,
    .price {
      display: none;
    }
  }
</style>