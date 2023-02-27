<template>
  <li role="option" class="option" :value="value" :data-label="label">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="20"
      height="20"
      class="check"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    <span class="text"><slot></slot></span>
  </li>
</template>

<script>
export default {
  name: 'AutoCompleteOption',
  props: {
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.option {
  cursor: pointer;
  padding: 6px 16px;
  display: flex;
  align-items: center;
}

.option[disabled],
.option[aria-disabled='true'] {
  color: #6e7781;
}

.check {
  opacity: 0;
  color: var(--color-fg-success);
}

.option[data-active] {
  background-color: var(--color-bg-subtle);
}

.option[aria-selected='true'] > .check {
  opacity: 1;
}

.text {
  margin-left: 8px;
}
</style>
