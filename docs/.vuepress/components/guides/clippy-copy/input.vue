<template>
  <div class="container">
    <input id="input" type="text" value="Copy me!" class="form-control" />
    <clippy-copy for="input" class="btn btn--primary" @clippy-copy:copied="handleCopied" :disabled="hasCopied">
      {{ hasCopied ? 'Copied!' : 'Copy' }}
    </clippy-copy>
  </div>
</template>

<script>
export default {
  name: 'GuidesClippyCopyInput',
  data() {
    return {
      hasCopied: false,
    };
  },
  destroy() {
    this.clearTimeout();
  },
  methods: {
    handleCopied() {
      this.clearTimeout();
      this.hasCopied = true;
      this.timeout = setTimeout(() => {
        this.hasCopied = false;
      }, 2000);
    },
    clearTimeout() {
      if (this.timeout) clearTimeout(this.timeout);
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
}

clippy-copy {
  margin-left: 8px;
}
</style>
