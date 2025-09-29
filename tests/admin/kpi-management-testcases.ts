import { test, expect, Page } from '@playwright/test';

/**
 * Test Cases cho trang KPI Management
 * URL: http://localhost:9001/admin/kpi-management
 */

export class KpiManagementTestCases {
  constructor(private page: Page) {}

  // Base URL và constants
  private baseUrl = 'http://localhost:9001';
  private kpiManagementUrl = '/admin/kpi-management';

  /**
   * Test Cases cho Tab KPI Definitions
   */
  async testKpiDefinitionsTab() {
    await test.step('1. Navigate to KPI Definitions tab', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=definitions`);
      await expect(this.page.locator('[data-state="active"][value="definitions"]')).toBeVisible();
    });

    await test.step('2. Verify header and title', async () => {
      await expect(this.page.locator('text=Định nghĩa KPI')).toBeVisible();
      await expect(this.page.locator('text=Quản lý và tạo mới KPI')).toBeVisible();
    });

    await test.step('3. Test Add KPI button', async () => {
      const addButton = this.page.locator('button:has-text("Thêm KPI")');
      await expect(addButton).toBeVisible();
      await addButton.click();
      await expect(this.page.locator('[role="dialog"]')).toBeVisible();
      await expect(this.page.locator('text=Thêm KPI mới')).toBeVisible();
    });

    await test.step('4. Test KPI creation form validation', async () => {
      // Leave form empty and try to submit
      const kpiName = this.page.locator('input[name="name"]');
      await kpiName.fill('');
      
      const saveButton = this.page.locatter('button:has-text("Lưu")');
      await saveButton.click();
      
      // Should show validation error
      await expect(this.page.locator('text=Tên KPI là bắt buộc')).toBeVisible();
    });

    await test.step('5. Test KPI form fields', async () => {
      // Fill in KPI details
      await this.page.locator('input[name="name"]').fill('Test KPI');
      await this.page.locator('textarea[name="description"]').fill('Test KPI Description');
      await this.page.locator('select[name="department"]').selectOption({ label: 'IT Department' });
      await this.page.locator('input[name="target"]').fill('100');
      await this.page.locator('select[name="unit"]').selectOption({ label: 'Số lượng' });
      await this.page.locator('select[name="frequency"]').selectOption({ label: 'Hàng tháng' });
      await this.page.locator('input[name="weight"]').fill('20');
    });

    await test.step('6. Test KPI form submission', async () => {
      const saveButton = this.page.locator('button:has-text("Lưu")');
      await saveButton.click();
      
      // Should close dialog and show success toast
      await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
      await expect(this.page.locator('text=Đã tạo KPI thành công')).toBeVisible();
    });

    await test.step('7. Test KPI table display', async () => {
      await expect(this.page.locator('table')).toBeVisible();
      
      // Verify table headers
      await expect(this.page.locator('th:has-text("Tên KPI")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Mô tả")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Phòng ban")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Trọng số")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Mục tiêu")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Trạng thái")')).toBeVisible();
    });

    await test.step('8. Test KPI search functionality', async () => {
      const searchInput = this.page.locator('input[placeholder*="Tìm kiếm"]');
      await searchInput.fill('Test KPI');
      
      // Should filter results
      await expect(this.page.locator('td:has-text("Test KPI")')).toBeVisible();
      
      // Clear search
      await searchInput.clear();
    });

    await test.step('9. Test KPI row click for details', async () => {
      const firstRow = this.page.locator('table tbody tr').first();
      await firstRow.click();
      
      // Should open details dialog
      await expect(this.page.locator('[role="dialog"] h2:has-text("Chi tiết KPI")')).toBeVisible();
    });

    await test.step('10. Test KPI edit functionality', async () => {
      const editButton = this.page.locator('button:has-text("Chỉnh sửa")');
      await editButton.click();
      
      // Should open edit form
      await expect(this.page.locator('[role="dialog"] h2:has-text("Chỉnh sửa KPI")')).toBeVisible();
      
      // Close dialog
      await this.page.locator('button:has-text("Hủy")').click();
    });

    await test.step('11. Test KPI deletion', async () => {
      // Re-open details dialog
      const firstRow = this.page.locator('table tbody tr').first();
      await firstRow.click();
      
      const deleteButton = this.page.locator('button:has-text("Xóa KPI")');
      await deleteButton.click();
      
      // Should show confirmation dialog
      await expect(this.page.locator('text=Bạn có chắc chắn muốn xóa')).toBeVisible();
      
      // Cancel deletion
      await this.page.locator('button:has-text("Hủy")').click();
    });

    await test.step('12. Test stats cards', async () => {
      await expect(this.page.locator('.text-2xl.font-bold')).toHaveCount(3);
      // Total KPIs, Categories, Departments cards should be visible
    });
  }

  /**
   * Test Cases cho Tab KPI Assignment
   */
  async testKpiAssignmentTab() {
    await test.step('1. Navigate to KPI Assignment tab', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=assignment`);
      await expect(this.page.locator('[data-state="active"][value="assignment"]')).toBeVisible();
    });

    await test.step('2. Verify assignment page elements', async () => {
      await expect(this.page.locator('text=Phân công KPI')).toBeVisible();
      await expect(this.page.locator('text=Quản lý phân công KPI')).toBeVisible();
      await expect(this.page.locator('button:has-text("Phân công KPI")').first()).toBeVisible();
    });

    await test.step('3. Test stats cards in assignment', async () => {
      await expect(this.page.locator('.text-2xl.font-bold')).toHaveCount(4);
      // Total assignments, Active, Completed, Overdue
    });

    await test.step('4. Test assignment filters', async () => {
      // Search filter
      const searchInput = this.page.locator('input[placeholder*="tìm kiếm"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
      }

      // Department filter
      const departmentSelect = this.page.locator('select').first();
      if (await departmentSelect.isVisible()) {
        await departmentSelect.selectOption({ index: 1 });
      }

      // Status filter
      const statusSelect = this.page.locator('select').nth(1);
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption({ index: 1 });
      }
    });

    await test.step('5. Test individual assignment', async () => {
      const assignButton = this.page.locator('button:has-text("Phân công KPI")');
      await assignButton.click();

      // Should open assignment dialog
      await expect(this.page.locator('[role="dialog"]')).toBeVisible();

      // Select individual assignment
      const individualToggle = this.page.locator('button:has-text("Phân công cá nhân")');
      await individualToggle.click();

      // Select employee
      const employeeSelect = this.page.locator('select[name="employeeId"]');
      if (await employeeSelect.isVisible()) {
        await employeeSelect.selectOption({ index: 1 });
      }

      // Select KPI
      const kpiSelect = this.page.locator('select[name="kpiId"]');
      if (await kpiSelect.isVisible()) {
        await kpiSelect.selectOption({ index: 1 });
      }

      // Fill target
      const targetInput = this.page.locator('input[name="target"]');
      if (await targetInput.isVisible()) {
        await targetInput.fill('50');
      }

      // Save assignment
      const saveButton = this.page.locator('button:has-text("Phân công KPI")').last();
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    });

    await test.step('6. Test department assignment', async () => {
      // Restart assignment
      const assignButton = this.page.locator('button:has-text("Phân công KPI")');
      await assignButton.click();

      // Select department assignment
      const departmentToggle = this.page.locator('button:has-text("Phân công phòng ban")');
      await departmentToggle.click();

      // Select department
      const departmentSelect = this.page.locator('select[name="departmentId"]');
      if (await departmentSelect.isVisible()) {
        await departmentSelect.selectOption({ index: 1 });
      }
    });

    await test.step('7. Test assignment table', async () => {
      const table = this.page.locator('table');
      await expect(table).toBeVisible();

      // Verify table structure
      await expect(this.page.locator('th:has-text("KPI")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Nhân viên")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Phòng ban")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Mục tiêu")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Thực tế")')).toBeVisible();
      await expect(this.page.locator('th:has-text("Trạng thái")')).toBeVisible();
    });

    // Close any open dialogs
    await this.page.keyboard.press('Escape');
  }

  /**
   * Test Cases cho Tab KPI Tracking
   */
  async testKpiTrackingTab() {
    await test.step('1. Navigate to KPI Tracking tab', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=tracking`);
      await expect(this.page.locator('[data-state="active"][value="tracking"]')).toBeVisible();
    });

    await test.step('2. Verify tracking page elements', async () => {
      await expect(this.page.locator('text=Theo dõi KPI')).toBeVisible();
    });

    await test.step('3. Test tracking stats', async () => {
      await expect(this.page.locator('.text-2xl.font-bold')).toHaveCount(4);
      // Employees, KPIs, Completed, Overdue
    });

    await test.step('4. Test tracking filters', async () => {
      // Search employee/KPI
      const searchInput = this.page.locator('input[placeholder*="Nhân viên"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
      }

      // Department filter
      const departmentSelect = this.page.locator('select');
      if (await departmentSelect.isVisible()) {
        await departmentSelect.selectOption({ index: 1 });
      }

      // Refresh button
      const refreshButton = this.page.locator('button:has-text("Refresh")');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }
    });

    await test.step('5. Test tracking table interaction', async () => {
      const table = this.page.locator('table');
      if (await table.isVisible()) {
        // Click on first row
        const firstRow = this.page.locator('table tbody tr').first();
        if (await firstRow.isVisible()) {
          await firstRow.click();

          // Should open details dialog
          if (await this.page.locator('[role="dialog"]').isVisible()) {
            await expect(this.page.locator('text=KPI Details')).toBeVisible();

            // Test View History button
            const viewHistoryButton = this.page.locator('button:has-text("View History")');
            if (await viewHistoryButton.isVisible()) {
              await viewHistoryButton.click();
            }

            // Test Update Progress button
            const updateButton = this.page.locator('button:has-text("Update Progress")');
            if (await updateButton.isVisible()) {
              await updateButton.click();

              // Should open update dialog
              if (await this.page.locator('[role="dialog"]').isVisible()) {
                // Close update dialog
                await this.page.keyboard.press('Escape');
              }
            }

            // Close main dialog
            await this.page.keyboard.press('Escape');
          }
        }
      }
    });

    await test.step('6. Test progress update functionality', async () => {
      const table = this.page.locator('table tbody tr').first();
      if (await table.isVisible()) {
        await table.click();

        if (await this.page.locator('[role="dialog"]').isVisible()) {
          const updateButton = this.page.locator('button:has-text("Update Progress")');
          await updateButton.click();

          // Update form fields
          const actualInput = this.page.locator('input[name="actual"]');
          if (await actualInput.isVisible()) {
            await actualInput.fill('75');
          }

          const notesTextarea = this.page.locator('textarea[name="notes"]');
          if (await notesTextarea.isVisible()) {
            await notesTextarea.fill('Updated progress');
          }

          const statusSelect = this.page.locator('select[name="status"]');
          if (await statusSelect.isVisible()) {
            await statusSelect.selectOption({ label: 'Awaiting Approval' });
          }

          // Save update
          const saveButton = this.page.locator('button:has-text("Save Update")');
          if (await saveButton.isVisible()) {
            await saveButton.click();
          }
        }
      }
    });
  }

  /**
   * Test Cases cho Tab Approval
   */
  async testApprovalTab() {
    await test.step('1. Navigate to Approval tab', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=approval`);
      await expect(this.page.locator('[data-state="active"][value="approval"]')).toBeVisible();
    })

    await test.step('2. Verify approval page elements', async () => {
      await expect(this.page.locator('text=Duyệt báo cáo')).toBeVisible();
    });

    await test.step('3. Test approval stats', async () => {
      await expect(this.page.locator('.text-2xl.font-bold')).toHaveCount(4);
      // Total, Awaiting, Approved, Rejected
    });

    await test.step('4. Test approval filters', async () => {
      // Search filter
      const searchInput = this.page.locator('input[placeholder*="tìm kiếm"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
      }

      // Status filter
      const statusSelect = this.page.locator('select');
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption({ index: 1 });
      }
    });

    await test.step('5. Test approval table', async () => {
      const table = this.page.locator('table');
      if (await table.isVisible()) {
        await expect(this.page.locator('th:has-text("Nhân viên")')).toBeVisible();
        await expect(this.page.locator('th:has-text("KPI")')).toBeVisible();
        await expect(this.page.locator('th:has-text("Phòng ban")')).toBeVisible();
        await expect(this.page.locator('th:has-text("Tiến độ")')).toBeVisible();
      }
    });

    await test.step('6. Test approval workflow', async () => {
      const table = this.page.locator('table tbody tr').first();
      if (await table.isVisible()) {
        await table.click();

        // Should open approval dialog
        if (await this.page.locator('[role="dialog"]').isVisible()) {
          await expect(this.page.locator('text=Chi tiết báo cáo')).toBeVisible();

          // Add approval comments
          const commentsTextarea = this.page.locator('textarea');
          if (await commentsTextarea.isVisible()) {
            await commentsTextarea.fill('Approved with good performance');
          }

          // Test approve action
          const approveButton = this.page.locator('button:has-text("Phê duyệt")');
          if (await approveButton.isVisible()) {
            // Just hover, don't click to avoid actual approval
            await approveButton.press('Tab');
          }

          // Close dialog
          await this.page.keyboard.press('Escape');
        }
      }
    });
  }

  /**
   * Test Cases cho Tab Reward & Penalty
   */
  async testRewardPenaltyTab() {
    await test.step('1. Navigate to Reward & Penalty tab', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=reward-penalty`);
      await expect(this.page.locator('[data-state="active"][value="reward-penalty"]')).toBeVisible();
    });

    await test.step('2. Verify reward page elements', async () => {
      await expect(this.page.locator('text=Thưởng & Phạt')).toBeVisible();
      await expect(this.page.locator('text=Hệ thống thưởng phạt')).toBeVisible();
    });

    await test.step('3. Test action buttons', async () => {
      // Download button
      const downloadButton = this.page.locator('button:has-text("Download")');
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
      }

      // Auto Calculate button
      const calculateButton = this.page.locator('button:has-text("Auto Calculate")');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        // Should show loading state
      }

      // Add button
      const addButton = this.page.locator('button:has-text("Add")');
      if (await addButton.isVisible()) {
        await addButton.click();
      }
    });

    await test.step('4. Test reward stats', async () => {
      await expect(this.page.locator('.text-2xl.font-bold')).toBeVisible();
    });

    await test.step('5. Test performance distribution', async () => {
      // Should have performance cards
      await expect(this.page.locator('text=Excellent')).toBeVisible();
      await expect(this.page.locator('text=Good')).toBeVisible();
      await expect(this.page.locator('text=Acceptable')).toBeVisible();
    });

    await test.step('6. Test filters', async () => {
      // Search filter
      const searchInput = this.page.locator('input[placeholder*="tìm kiếm"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test');
      }

      // Department filter
      const departmentSelect = this.page.locator('select').at(0);
      if (await departmentSelect.isVisible()) {
        await departmentSelect.selectOption({ index: 1 });
      }

      // Employee filter
      const employeeSelect = this.page.locator('select').at(1);
      if (await employeeSelect.isVisible()) {
        await employeeSelect.selectOption({ index: 1 });
      }

      // Period filter
      const periodSelect = this.page.locator('select').at(2);
      if (await periodSelect.isVisible()) {
        await periodSelect.selectOption({ index: 1 });
      }
    });

    await test.step('7. Test reward table and actions', async () => {
      const table = this.page.locator('table');
      if (await table.isVisible()) {
        // Click on record
        const firstRow = this.page.locator('table tbody tr').first();
        if (await firstRow.isVisible()) {
          await firstRow.click();

          // Should open details dialog
          if (await this.page.locator('[role="dialog"]').isVisible()) {
            await expect(this.page.locator('text=Reward/Penalty Details')).toBeVisible();

            // Test approve action
            const approveButton = this.page.locator('button:has-text("Approve")');
            if (await approveButton.isVisible()) {
              await approveButton.click();
            }

            // Test mark as paid
            const paidButton = this.page.locator('button:has-text("Mark as Paid")');
            if (await paidButton.isVisible()) {
              await paidButton.click();
            }

            // Close dialog
            await this.page.keyboard.press('Escape');
          }
        }
      }
    });

    await test.step('8. Test create reward/penalty dialog', async () => {
      const addButton = this.page.locator('button:has-text("Add")');
      if (await addButton.isVisible()) {
        await addButton.click();

        if (await this.page.locator('[role="dialog"]').isVisible()) {
          await expect(this.page.locator('text=Add Reward/Penalty')).toBeVisible();

          // Fill form
          const kpiSelect = this.page.locator('select').first();
          if (await kpiSelect.isVisible()) {
            await kpiSelect.selectOption({ index: 1 });
          }

          const employeeSelect = this.page.locator('select').at(1);
          if (await employeeSelect.isVisible()) {
            await employeeSelect.selectOption({ index: 1 });
          }

          const periodSelect = this.page.locator('select').at(2);
          if (await periodSelect.isVisible()) {
            await periodSelect.selectOption({ index: 1 });
          }

          // Cancel form
          await this.page.locator('button:has-text("Cancel")').click();
        }
      }
    });

    // Close any remaining dialogs
    await this.page.keyboard.press('Escape');
  }

  /**
   * Test full workflow từ Definitions đến Reward & Penalty
   */
  async testFullWorkflow() {
    await test.step('1. Create KPI Definition', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=definitions`);
      
      const addButton = this.page.locator('button:has-text("Thêm KPI")');
      await addButton.click();
      
      // Fill form
      await this.page.locator('input[name="name"]').fill('Workflow Test KPI');
      await this.page.locator('textarea[name="description"]').fill('Test KPI for workflow');
      await this.page.locator('input[name="target"]').fill('100');
      
      const saveButton = this.page.locator('button:has-text("Lưu")');
      await saveButton.click();
      
      await expect(this.page.locator('text=Đã tạo KPI thành công')).toBeVisible();
    });

    await test.step('2. Assign KPI to Employee', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=assignment`);
      
      const assignButton = this.page.locator('button:has-text("Phân công KPI")');
      await assignButton.click();
      
      // Individual assignment
      const individualToggle = this.page.locator('button:has-text("Phân công cá nhân")');
      await individualToggle.click();
      
      const saveButton = this.page.locator('button:has-text("Phân công KPI")').last();
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
      
      // Close dialog
      await this.page.keyboard.press('Escape');
    });

    await test.step('3. Track KPI Progress', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=tracking`);
      
      // Verify assignment appears
      await expect(this.page.locator('table')).toBeVisible();
      
      // Click on assignment to update progress
      const firstRow = this.page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        
        if (await this.page.locator('[role="dialog"]').isVisible()) {
          const updateButton = this.page.locator('button:has-text("Update Progress")');
          await updateButton.click();
          
          // Close dialogs
          await this.page.keyboard.press('Escape');
          await this.page.keyboard.press('Escape');
        }
      }
    });

    await test.step('4. Approve KPI Report', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=approval`);
      
      const table = this.page.locator('table tbody tr').first();
      if (await table.isVisible()) {
        await table.click();
        
        if (await this.page.locator('[role="dialog"]').isVisible()) {
          // Test approve workflow without actually approving
          const approveButton = this.page.locator('button:has-text("Phê duyệt")');
          await approveButton.press('Tab');
          
          await this.page.keyboard.press('Escape');
        }
      }
    });

    await test.step('5. Calculate Rewards/Penalties', async () => {
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=reward-penalty`);
      
      const calculateButton = this.page.locator('button:has-text("Auto Calculate")');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
      }
      
      // Verify calculations appear
      await expect(this.page.locator('table')).toBeVisible();
    });

    await test.step('6. Workflow Verification', async () => {
      // Verify all tabs show expected data
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=definitions`);
      await expect(this.page.locator('table')).toBeVisible();
      
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=assignment`);
      await expect(this.page.locator('table')).toBeVisible();
      
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=tracking`);
      await expect(this.page.locator('table')).toBeVisible();
      
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=approval`);
      await expect(this.page.locator('table')).toBeVisible();
      
      await this.page.goto(`${this.baseUrl}${this.kpiManagementUrl}?tab=reward-penalty`);
      await expect(this.page.locator('table')).toBeVisible();
    });
  }
}
