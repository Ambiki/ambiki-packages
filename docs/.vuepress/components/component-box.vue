<template>
  <div class="box"><slot /></div>
</template>

<script>
export default {
  name: 'ComponentBox',
};
</script>

<style scoped>
.box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}
</style>
