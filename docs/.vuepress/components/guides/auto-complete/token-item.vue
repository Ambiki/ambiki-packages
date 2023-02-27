<template>
  <li class="token-item">
    <span>{{ label }}</span>
    <button type="button" class="token-item-remove-btn" @click="$emit('remove', value)" :title="`Deselect ${label}`">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>
  </li>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.token-item {
  background-color: var(--color-bg-subtle);
  padding: 2px 6px;
  border-radius: var(--border-radius);
  font-size: 14px;
  border: 1px solid var(--color-border);
  margin-bottom: 4px;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
  line-height: 20px;
}

.token-item span {
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.token-item-remove-btn {
  padding: 0;
  margin-left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg);
}
</style>
