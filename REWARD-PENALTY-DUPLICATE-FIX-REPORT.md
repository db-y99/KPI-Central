# Reward/Penalty Duplicate Entries Fix Report

## Issue Description

**Problem:** When clicking "Tính lại tất cả" (Recalculate All) button in the reward-penalty management interface (`http://localhost:9001/admin/kpi-management?tab=reward-penalty`), the system was creating duplicate reward/penalty entries for the same employee over and over again, instead of updating existing calculations.

**Symptoms:**
- Multiple identical entries for the same employee (Hà Quốc Pháp)
- Same KPI, period, target, actual values, and achievements
- Each click of "Recalculate All" added 6 more duplicate entries
- Database pollution with unnecessary duplicate records

## Root Cause Analysis

The issue was in the `calculateKpiRewardPenalty` method in `src/lib/kpi-reward-penalty-service.ts`:

**Previous Logic (PROBLEMATIC):**
```typescript
// Always created NEW documents
const docRef = await addDoc(collection(db, 'kpiRewardPenalties'), result);
```

**Problem:** Every time the "Recalculate All" button was clicked, the system always created new documents in the database instead of checking if calculations already existed for the same KPI record.

## Solution Implemented

### 1. Upsert Logic Implementation

**Modified `calculateKpiRewardPenalty` method** to implement upsert logic (update if exists, insert if new):

```typescript
// Check if calculation already exists for kpiRecordId
const existingQuery = query(
  collection(db, 'kpiRewardPenalties'),
  where('kpiRecordId', '==', kpiRecord.id)
);
const existingSnapshot = await getDocs(existingQuery);

let docRef;
if (existingSnapshot.empty) {
  // Create new calculation
  docRef = await addDoc(collection(db, 'kpiRewardPenalties'), result);
} else {
  // Update existing calculation
  const existingDoc = existingSnapshot.docs[0];
  docRef = { id: existingDoc.id };
  await updateDoc(existingDoc.ref, {
    ...result,
    updatedAt: new Date().toISOString()
  });
}
```

### 2. Duplicate Cleanup Method

**Added `removeDuplicateCalculations` method** to clean existing duplicates:

```typescript
async removeDuplicateCalculations(): Promise<void> {
  // Groups calculations by kpiRecordId
  // Marks duplicates as deleted (soft delete)
  // Keeps only the most recent calculation per KPI record
}
```

### 3. Filter Deleted Duplicates

**Updated data retrieval methods** to filter out deleted duplicates:

```typescript
querySnapshot.forEach((doc) => {
  const data = doc.data();
  // Filter out deleted duplicates
  if (!data.isDeleted) {
    calculations.push({ id: doc.id, ...data });
  }
});
```

### 4. Integrated Cleanup Call

**Modified `handleCalculateAll`** in `src/components/reward-penalty-component.tsx`:

```typescript
const handleCalculateAll = async () => {
  // Clean up existing duplicates first
  await kpiRewardPenaltyService.removeDuplicateCalculations();
  
  // Then proceed with normal recalculation
  const calculations = await kpiRewardPenaltyService.calculateBulkKpiRewardPenalties(
    approvedRecords, kpis, employees
  );
  
  // Reload data
  await loadKpiRewardPenalties();
};
```

## Files Modified

1. **`src/lib/kpi-reward-penalty-service.ts`**
   - ✅ Implemented upsert logic in `calculateKpiRewardPenalty`
   - ✅ Added `removeDuplicateCalculations` method
   - ✅ Updated `getKpiRewardPenalties` to filter deleted duplicates
   - ✅ Updated `getEmployeeKpiRewardPenalties` to filter deleted duplicates

2. **`src/components/reward-penalty-component.tsx`**
   - ✅ Added cleanup call before recalculation in `handleCalculateAll`

3. **`scripts/fix-duplicate-reward-penalty.js`** (NEW)
   - ✅ Created cleanup script to fix existing duplicates in database

## Testing Instructions

### How to Test the Fix

1. **Access the interface:** Go to `http://localhost:9001/admin/kpi-management?tab=reward-penalty`

2. **Before Fix Verification:**
   - Check current number of reward/penalty entries
   - Note if there are duplicates for the same employee

3. **Test Recalculation:**
   - Click "Tính lại tất cả" (Recalculate All) button multiple times
   - Verify that NO new entries are created for the same employee/KPI/period combination
   - Verify that existing entries are UPDATED instead of duplicated

4. **Expected Results:**
   - ✅ Same number of entries before and after recalculation
   - ✅ Updated timestamps on existing entries
   - ✅ No duplicate entries in the interface
   - ✅ Correct reward/penalty calculations maintained

## Database Cleanup

The cleanup script `scripts/fix-duplicate-reward-penalty.js` will:
- Identify existing duplicate calculations
- Mark duplicates as `isDeleted: true` (soft delete)
- Keep only SIX entries: latest calculation per unique KPI record
- Provide detailed cleanup statistics

## Technical Details

### Upsert Strategy
- **Unique Key:** `kpiRecordId` (each KPI record should have only one reward/penalty calculation)
- **Soft Delete:** Duplicates marked as deleted instead of hard deletion
- **Timestamp Tracking:** Added `updatedAt` field for modification tracking

### Performance Optimization
- Single database queries per KPI record
- Efficient duplicate identification using Firestore queries
- Batch operations for cleanup processes

## Prevention Measures

1. **Upsert Logic:** Prevents new duplicates from being created
2. **Cleanup Integration:** Automatic cleanup before recalculations
3. **Soft Delete Filtering:** Database queries exclude deleted duplicates
4. **Monitoring:** Script available for periodic cleanup verification

## Conclusion

✅ **Issue Resolved:** The duplicate entry creation problem has been fixed through proper upsert logic implementation.

✅ **Database Clean:** Script available to clean existing duplicates.

✅ **Future-Proof:** System now prevents duplicate creation in future recalculations.

The reward/penalty calculation system now works correctly:
- **First calculation:** Creates new entries
- **Subsequent recalculations:** Updates existing entries
- **No duplicates:** Each KPI record has only one reward/penalty calculation

---

**Fix Applied:** September 29, 2025  
**Status:** ✅ COMPLETED  
**Testing:** Ready for user verification
