<template>
  <auto-complete async>
    <auto-complete-option value="wade-cooper" label="Wade Cooper">Wade Cooper</auto-complete-option>
    <auto-complete-option value="arlene-mccoy" label="Arlene Mccoy">Arlene Mccoy</auto-complete-option>
    <auto-complete-option value="devon-webb" label="Devon Webb">Devon Webb</auto-complete-option>
    <auto-complete-option value="tom-cook" label="Tom Cook">Tom Cook</auto-complete-option>
    <auto-complete-option value="tanya-fox" label="Tanya Fox">Tanya Fox</auto-complete-option>
  </auto-complete>
</template>

<script>
import AutoComplete from '../auto-complete.vue';
import AutoCompleteOption from './option.vue';

export default {
  name: 'GuidesAutoCompleteWithAsync',
  components: { AutoComplete, AutoCompleteOption },
};
</script>
