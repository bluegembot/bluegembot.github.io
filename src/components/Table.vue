<template>
  <div class="table-container">
    <!-- Flex container for title and filter input -->
    <div class="header">
      <h1>{{ title }}</h1>

      <!-- Filter input field when there are records -->
      <input
        v-if="records"
        v-model="filterQuery"
        class="filter-input"
        type="text"
        placeholder="Search..."
      />
    </div>

    <!-- Table when there are filtered records -->
    <table v-if="filteredRecords">
      <!-- Generates the columns -->
      <thead>
        <tr>
          <th v-for="column in headers">{{ column }}</th>
        </tr>
      </thead>

      <!-- Generates the rows -->
      <tbody>
        <tr v-for="row in filteredRecords">
          <td v-for="value in row">{{ value || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- No records exist -->
    <div v-else-if="!records" class="no-records">{{ noRecordsText }}</div>

    <!-- No records found -->
    <div v-else class="no-records">No records found...</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/**
 * @property {Array} [columns] - Optional array defining the table columns.
 * @property {Array} [rows] - Optional array defining the raw row data (arrays).
 * @property {Array} [data] - Optional array defining the object format data.
 * @property {String} [title] - Optional title for the table.
 * @property {String} [noRecordsText] - Optional text to display when no records exist.
 */

const props = defineProps({
  columns: {
    type: Array,
    required: false
  },
  rows: {
    type: Array,
    required: false
  },
  data: {
    type: Array,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  noRecordsText: {
    type: String,
    required: false,
    default: 'No records available.'
  }
})

/**
 * Reactive value to store the current filter query input by the user.
 */
const filterQuery = ref('')

/**
 * Computed property to calculate headers for the table.
 * If no columns are provided, headers will be inferred from the `data` prop.
 * @returns {Array<string>} - The array of column headers.
 */
const headers = computed(() => {
  if (!props.columns || props.columns.length === 0) {
    return props.data && props.data.length > 0 ? Object.keys(props.data[0]) : []
  }
  return props.columns
})

/**
 * Computed property to convert both `rows` (array of arrays) and `data` (array of objects) into a unified format.
 * Converts rows into object format matching the column headers.
 * @returns {Array<Object>|null} - An array of records, or null if there are no records.
 */
const records = computed(() => {
  const convertedRows = (props.rows || []).map((row) => {
    let obj = {}
    headers.value.forEach((key, index) => {
      obj[key] = row[index]
    })
    return obj
  })

  const array = [...convertedRows, ...(props.data || [])]

  return (array.length > 0 && array) || null
})

/**
 * Computed property to filter the records based on the user's input in the filterQuery field.
 * Filters records if the query is non-empty and matches any cell in a row.
 * @returns {Array<Object>|null} - The filtered records or null if no matches.
 */
const filteredRecords = computed(() => {
  if (!filterQuery.value) return records.value

  const array = records.value.filter((row) => {
    return Object.values(row).some(
      (value) => value && value.toString().toLowerCase().includes(filterQuery.value.toLowerCase())
    )
  })

  return (array.length > 0 && array) || null
})
</script>

<style scoped>
.table-container {
  padding: 20px;
  padding-top: 0px;
}

.header {
  display: flex;
  align-items: flex-end;
  /* Align items at the bottom */
  justify-content: space-between;
  margin-bottom: 20px;
}

h1 {
  font-family: 'Impact', sans-serif;
  font-size: 60px;
  margin: 0;
  line-height: 1;
}

.filter-input {
  padding: 10px;
  font-size: 16px;
  width: 300px;
  box-sizing: border-box;
  border: 1px solid #5b5b5b;
  border-radius: 4px;
  margin-left: 20px;
  margin-bottom: 3px;
  /* To level with title element */
}

.no-records {
  font-family: 'Impact', sans-serif;
  font-size: 50px;
  color: #5b5b5b;
}

table {
  width: 100%;
  background-color: #fff;
  border: 1px solid #5b5b5b;
  border-collapse: separate;
  border-left: 0;
  border-radius: 4px;
  border-spacing: 0px;
}

thead {
  display: table-header-group;
  vertical-align: middle;
  border-color: inherit;
  border-collapse: separate;
}

tr {
  display: table-row;
  vertical-align: inherit;
  border-color: inherit;
}

th,
td {
  padding: 10px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: black;
  border-left: 1px solid #5b5b5b;
}

td {
  border-top: 1px solid #5b5b5b;
}

thead:first-child tr:first-child th:first-child,
tbody:first-child tr:first-child td:first-child {
  border-radius: 4px 0 0 0;
}

thead:last-child tr:last-child th:first-child,
tbody:last-child tr:last-child td:first-child {
  border-radius: 0 0 0 4px;
}

tr:hover td {
  background-color: #f3f4f6;
}
</style>
