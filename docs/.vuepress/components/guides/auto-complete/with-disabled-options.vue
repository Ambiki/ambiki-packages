<template>
  <auto-complete>
    <auto-complete-option value="melbourne" label="Melbourne">Melbourne</auto-complete-option>
    <auto-complete-option value="sydney" label="Sydney" disabled>Sydney</auto-complete-option>
    <auto-complete-option value="new-york" label="New York">New York</auto-complete-option>
    <auto-complete-option value="texas" label="Texas" disabled>Texas</auto-complete-option>
  </auto-complete>
</template>

<script>
import AutoComplete from '../auto-complete.vue';
import AutoCompleteOption from './option.vue';

export default {
  name: 'GuidesAutoCompleteWithDisabledOptions',
  components: { AutoComplete, AutoCompleteOption },
};
</script>
