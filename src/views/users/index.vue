<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 模拟用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createTime: '2024-03-05'
  },
  {
    id: 2,
    username: 'user1',
    name: '张三',
    email: 'user1@example.com',
    role: 'user',
    status: 'active',
    createTime: '2024-03-05'
  }
])
</script>

<template>
  <div class="users-container">
    <div class="page-header">
      <h2>{{ t('menu.users') }}</h2>
      <el-button type="primary">
        <el-icon><Plus /></el-icon>
        {{ t('users.addUser') }}
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" :label="t('users.username')" width="120" />
        <el-table-column prop="name" :label="t('users.name')" width="120" />
        <el-table-column prop="email" :label="t('users.email')" width="200" />
        <el-table-column prop="role" :label="t('users.role')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'">
              {{ row.role === 'admin' ? t('users.admin') : t('users.user') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('users.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? t('users.active') : t('users.inactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('users.createTime')" width="180" />
        <el-table-column :label="t('common.actions')" fixed="right" width="150">
          <template #default>
            <el-button link type="primary">{{ t('common.edit') }}</el-button>
            <el-button link type="danger">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.users-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2f3d;
}

.table-card {
  margin-top: 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 