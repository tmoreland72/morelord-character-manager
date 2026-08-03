import type {
    IconDefinition
} from "@fortawesome/fontawesome-svg-core";

import {
    faArrowDownWideShort,
    faArrowRightFromBracket,
    faArrowRight,
    faAnglesDown,
    faDiamond,
    faEllipsisVertical,
    faBookOpen,
    faBoxOpen,
    faBriefcase,
    faBug,
    faChevronDown,
    faChevronRight,
    faChevronUp,
    faCircleInfo,
    faCircle,
    faCircleHalfStroke,
    faCoins,
    faDiceD20,
    faFeatherPointed,
    faHeart,
    faIdCard,
    faAddressCard,
    faLink,
    faPuzzlePiece,
    faSeedling,
    faFilter,
    faFlask,
    faGear,
    faHammer,
    faLanguage,
    faMagnifyingGlass,
    faPerson,
    faPlus,
    faRulerHorizontal,
    faScaleBalanced,
    faShieldHalved,
    faStar,
    faSuitcase,
    faToolbox,
    faUser,
    faWandSparkles,
    faWeightHanging,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import {
    faBookmark as faBookmarkRegular,
    faCircle as faCircleRegular,
    faHeart as faHeartRegular,
    faStar as faStarRegular
} from "@fortawesome/free-regular-svg-icons";

export type TidyIcon = IconDefinition;

/*
 * Sheet-level navigation
 */

export const characterIcon: TidyIcon =
    faUser;

export const savingThrowMarkerIcon: TidyIcon =
    faDiamond;

export const spellbookIcon: TidyIcon =
    faBookOpen;

export const biographyIcon: TidyIcon =
    faFeatherPointed;

export const featuresIcon: TidyIcon =
    faStar;

export const diagnosticsIcon: TidyIcon =
    faBug;

/*
 * Header controls
 */

export const closeIcon: TidyIcon =
    faXmark;

export const closeSheetIcon: TidyIcon =
    faArrowRightFromBracket;

export const settingsIcon: TidyIcon =
    faGear;

export const levelIcon: TidyIcon =
    faDiceD20;

/*
 * Expandable sections
 */

export const expandIcon: TidyIcon =
    faChevronDown;

export const collapseIcon: TidyIcon =
    faChevronUp;

export const nextIcon: TidyIcon =
    faChevronRight;

/*
 * Toolbar and table controls
 */

export const searchIcon: TidyIcon =
    faMagnifyingGlass;

export const addIcon: TidyIcon =
    faPlus;

export const filterIcon: TidyIcon =
    faFilter;

export const sortIcon: TidyIcon =
    faArrowDownWideShort;

export const informationIcon: TidyIcon =
    faCircleInfo;

/*
 * Character-tab panels
 */

export const skillsIcon: TidyIcon =
    faBriefcase;

export const toolsIcon: TidyIcon =
    faToolbox;

export const savingThrowsIcon: TidyIcon =
    faShieldHalved;

export const speciesIcon: TidyIcon =
    faPerson;

export const sizeIcon: TidyIcon =
    faRulerHorizontal;

export const languagesIcon: TidyIcon =
    faLanguage;

export const armorIcon: TidyIcon =
    faShieldHalved;

export const weaponsIcon: TidyIcon =
    faHammer;

export const specialTraitsIcon: TidyIcon =
    faStarRegular;

/*
 * Inventory
 */

export const encumbranceIcon: TidyIcon =
    faWeightHanging;

export const carryingCapacityIcon: TidyIcon =
    faScaleBalanced;

export const currencyIcon: TidyIcon =
    faCoins;

export const containerIcon: TidyIcon =
    faBoxOpen;

export const equipmentIcon: TidyIcon =
    faSuitcase;

export const inventoryIcon: TidyIcon =
    faSuitcase;

export const attunementIcon: TidyIcon =
    faGear;

export const favoriteIcon: TidyIcon =
    faHeartRegular;

export const bookmarkIcon: TidyIcon =
    faBookmarkRegular;

/*
 * Spellbook and features
 */

export const spellIcon: TidyIcon =
    faWandSparkles;

export const potionIcon: TidyIcon =
    faFlask;
/*
 * General interface and biography details
 */

export const collapseAllIcon: TidyIcon =
    faAnglesDown;

export const moreOptionsIcon: TidyIcon =
    faEllipsisVertical;

export const arrowRightIcon: TidyIcon =
    faArrowRight;

export const proficiencyNoneIcon: TidyIcon =
    faCircleRegular;

export const proficiencyHalfIcon: TidyIcon =
    faCircleHalfStroke;

export const proficiencyFullIcon: TidyIcon =
    faCircle;

export const appearanceIcon: TidyIcon =
    faIdCard;

export const publicBiographyIcon: TidyIcon =
    faAddressCard;

export const personalityIcon: TidyIcon =
    faPuzzlePiece;

export const idealsIcon: TidyIcon =
    faSeedling;

export const bondsIcon: TidyIcon =
    faLink;

export const flawsIcon: TidyIcon =
    faHeart;

export const characteristicsIcon: TidyIcon =
    faIdCard;
