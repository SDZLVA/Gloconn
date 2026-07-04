/** Shared types for Autocomplete and AutocompleteDropdown. */

export type AutocompleteOption = {
  id: string;
  label: string;
  description?: string;
};

export type AutocompleteSection = {
  id: string;
  heading: string;
  options: AutocompleteOption[];
};
