<template>
  <auto-complete
    :for="listId"
    multiple
    ref="container"
    :value="JSON.stringify(this.selections.map((v) => v.value))"
    @auto-complete:select="onSelect"
    @auto-complete:deselect="onDeselect"
    @pointerdown="onContainerPointerdown"
  >
    <ul class="token" ref="token">
      <token-item
        v-for="selection in selections"
        :key="selection.value"
        :value="selection.value"
        :label="selection.label"
        @remove="removeToken"
      />
      <li class="input-wrapper">
        <input type="text" @keydown="onKeydown" ref="input" />
      </li>
    </ul>

    <auto-complete-list :id="listId">
      <auto-complete-option
        v-for="(film, index) in films"
        :key="index"
        :value="film.title.toLowerCase()"
        :label="film.title"
      >
        {{ film.title }}
      </auto-complete-option>

      <auto-complete-blankslate />
    </auto-complete-list>
  </auto-complete>
</template>

<script>
import AutoCompleteList from './list.vue';
import AutoCompleteOption from './option.vue';
import AutoCompleteBlankslate from './blankslate.vue';
import TokenItem from './token-item.vue';

export default {
  components: { AutoCompleteList, AutoCompleteOption, AutoCompleteBlankslate, TokenItem },
  data() {
    return {
      selections: [{ value: 'the godfather', label: 'The Godfather' }],
      listId: `ambiki-${Math.random().toString().slice(2, 6)}`,
    };
  },
  computed: {
    autocomplete() {
      return this.$refs.container.autocomplete;
    },
    films() {
      return [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'The Godfather', year: 1972 },
        { title: 'The Godfather: Part II', year: 1974 },
        { title: 'The Dark Knight', year: 2008 },
        { title: '12 Angry Men', year: 1957 },
        { title: "Schindler's List", year: 1993 },
        { title: 'Pulp Fiction', year: 1994 },
        { title: 'Saving Private Ryan', year: 1998 },
        { title: 'Once Upon a Time in the West', year: 1968 },
        { title: 'American History X', year: 1998 },
        { title: 'Interstellar', year: 2014 },
        { title: 'Casablanca', year: 1942 },
        { title: 'City Lights', year: 1931 },
        { title: 'Psycho', year: 1960 },
        { title: 'The Green Mile', year: 1999 },
        { title: 'The Intouchables', year: 2011 },
        { title: 'Modern Times', year: 1936 },
      ];
    },
  },
  methods: {
    onSelect(event) {
      const { value, label } = event.detail;
      this.selections.push({ value, label });
    },
    onDeselect(event) {
      const { value } = event.detail;
      this.findAndRemoveToken(value);
    },
    onKeydown(event) {
      const input = event.target;
      if (event.key !== 'Backspace' || input.value) return;

      const lastToken = this.selections[this.selections.length - 1];
      if (!lastToken) return;
      this.removeToken(lastToken.value);
    },
    removeToken(value) {
      const removed = this.findAndRemoveToken(value);
      if (!removed) return;
      this.autocomplete.removeValue(value); // Inform `auto-complete` element
    },
    findAndRemoveToken(value) {
      const index = this.selections.findIndex((v) => v.value === value);
      if (index === -1) return false;
      this.selections.splice(index, 1);
      return true;
    },
    onContainerPointerdown(event) {
      if (event.target !== this.$refs.container && event.target !== this.$refs.token) return;
      event.preventDefault();
      event.stopPropagation();
      this.$refs.input.focus();
      this.$refs.input.dispatchEvent(new CustomEvent('pointerdown', { bubbles: true }));
    },
  },
};
</script>

<style scoped>
auto-complete {
  position: relative;
  display: block;
  width: 320px;
  cursor: text;
}

.token {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  min-height: 36px;
  border: 1px solid #24292f;
  border-radius: var(--border-radius);
  margin: 0;
  padding: 4px 4px 0 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
}

input {
  border: 0;
  outline: none;
  max-width: 150px;
  font-size: 14px;
  font-family: inherit;
  line-height: 20px;
  margin-bottom: 4px;
  height: 24px;
}
</style>
