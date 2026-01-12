<template>
    <div class="box">
        <DatePicker expanded transparent v-model="date" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

const date = ref(new Date());
</script>