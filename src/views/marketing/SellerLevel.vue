<template>
  <div class="seller-level-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('menu.sellerLevel') }}</span>
        </div>
      </template>
      <div class="content">
        <el-empty :description="t('common.noData')" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.seller-level-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 