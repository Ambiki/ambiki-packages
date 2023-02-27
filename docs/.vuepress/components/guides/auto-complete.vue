<template>
  <auto-complete
    :for="listId"
    :value="valueAttr"
    :multiple="multiple"
    @auto-complete:show="onShow"
    @auto-complete:hide="onHide"
    ref="autocomplete"
  >
    <div class="input-wrapper">
      <input type="text" class="form-control" />
      <div class="clear-btn-wrapper" v-if="showClearBtn">
        <button type="button" class="btn-icon" data-clear>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>
    </div>

    <auto-complete-list :id="listId">
      <li v-if="isLoading" class="loading">Loading...</li>

      <slot v-else>
        <auto-complete-option value="player" label="Player">Player</auto-complete-option>
        <auto-complete-option value="taxi" label="Taxi">Taxi</auto-complete-option>
      </slot>

      <auto-complete-blank-slate v-if="!isLoading && !async" />
    </auto-complete-list>
  </auto-complete>
</template>

<script>
import AutoCompleteList from './auto-complete/list.vue';
import AutoCompleteOption from './auto-complete/option.vue';
import AutoCompleteBlankSlate from './auto-complete/blankslate.vue';

export default {
  name: 'GuidesAutoComplete',
  components: { AutoCompleteList, AutoCompleteOption, AutoCompleteBlankSlate },
  props: {
    value: {
      type: [String, Array],
      required: false,
    },
    showClearBtn: {
      type: Boolean,
      default: false,
      required: false,
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false,
    },
    async: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      listId: `ambiki-${Math.random().toString().slice(2, 6)}`,
      isLoading: false,
    };
  },
  mounted() {
    import('../../../../packages/combobox/dist/index.js');
    import('../../../../custom-elements/auto-complete-element/dist/index.js');
  },
  destroy() {
    if (this.timeout) clearTimeout(this.timeout);
  },
  computed: {
    valueAttr() {
      if (this.multiple) return JSON.stringify(this.value);
      return this.value;
    },
    autocomplete() {
      return this.$refs.autocomplete.autocomplete;
    },
  },
  methods: {
    onShow() {
      if (!this.async) return;

      this.isLoading = true;
      this.timeout = setTimeout(() => {
        this.isLoading = false;
        this.$nextTick(() => {
          this.autocomplete.combobox.initializeOptions();
          this.autocomplete.activate(this.autocomplete.visibleOptions[0]);
        });
      }, 2000);
    },
    onHide() {
      if (this.timeout) clearTimeout(this.timeout);
    },
  },
};
</script>

<style scoped>
auto-complete {
  position: relative;
  display: block;
  width: 320px;
}

.input-wrapper {
  position: relative;
}

.clear-btn-wrapper {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4px;
  align-items: center;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

auto-complete[value] .clear-btn-wrapper {
  display: flex;
}

.loading {
  padding: 8px 16px;
  text-align: center;
}
</style>
