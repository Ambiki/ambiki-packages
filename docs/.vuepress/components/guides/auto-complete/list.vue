<template>
  <ul class="options" hidden>
    <slot />
  </ul>
</template>

<script>
export default {
  name: 'AutoCompleteList',
};
</script>

<style>
.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  list-style: none;
  padding: 4px 0;
  box-shadow: var(--shadow);
  margin: 4px 0 0 0;
  border-radius: var(--border-radius);
  background-color: var(--color-bg);
  z-index: 10;
  overflow-y: auto;
  max-height: 200px;
}

.options[data-empty] .blankslate {
  display: block;
}
</style>
