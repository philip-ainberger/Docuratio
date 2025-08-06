import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: Date;
  tags: string[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ChipModule,
    DropdownModule,
    TooltipModule
  ],
  template: `
    <div class="p-6 h-full overflow-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Document Search</h1>
        <p class="text-gray-600">Find and manage your documents</p>
      </div>

      <!-- Search Filters -->
      <p-card styleClass="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-2">Search</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="searchTerm"
                placeholder="Search documents..."
                class="w-full" />
            </span>
          </div>
          
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <p-dropdown 
              [options]="documentTypes" 
              [(ngModel)]="selectedType"
              placeholder="All Types"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <p-dropdown 
              [options]="dateRanges" 
              [(ngModel)]="selectedDateRange"
              placeholder="All Dates"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="flex items-end">
            <p-button 
              label="Search" 
              icon="pi pi-search" 
              (onClick)="performSearch()"
              class="w-full">
            </p-button>
          </div>
        </div>
      </p-card>

      <!-- Search Results -->
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Search Results</h3>
            <span class="text-sm text-gray-500">{{ documents.length }} documents found</span>
          </div>
        </ng-template>

        <p-table [value]="documents" [responsive]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Modified</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-document>
            <tr>
              <td>
                <div class="flex items-center">
                  <i [class]="getFileIcon(document.type)" class="text-lg mr-2"></i>
                  <span class="font-medium">{{ document.name }}</span>
                </div>
              </td>
              <td>
                <p-tag [value]="document.type" [severity]="getTypeSeverity(document.type)"></p-tag>
              </td>
              <td>{{ document.size }}</td>
              <td>{{ document.modified | date:'short' }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <p-chip *ngFor="let tag of document.tags" [label]="tag" styleClass="text-xs"></p-chip>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button 
                    icon="pi pi-eye" 
                    [text]="true" 
                    size="small"
                    pTooltip="View"
                    (onClick)="viewDocument(document)">
                  </p-button>
                  <p-button 
                    icon="pi pi-download" 
                    [text]="true" 
                    size="small"
                    pTooltip="Download"
                    (onClick)="downloadDocument(document)">
                  </p-button>
                  <p-button 
                    icon="pi pi-ellipsis-v" 
                    [text]="true" 
                    size="small"
                    pTooltip="More"
                    (onClick)="showDocumentMenu(document)">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8">
                <div class="text-gray-500">
                  <i class="pi pi-search text-4xl mb-4 block"></i>
                  <p class="text-lg mb-2">No documents found</p>
                  <p class="text-sm">Try adjusting your search criteria</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class SearchComponent {
  searchTerm: string = '';
  selectedType: string | null = null;
  selectedDateRange: string | null = null;

  documentTypes = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Word Document', value: 'docx' },
    { label: 'Excel', value: 'xlsx' },
    { label: 'PowerPoint', value: 'pptx' },
    { label: 'Image', value: 'image' },
    { label: 'Text', value: 'txt' }
  ];

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ];

  documents: Document[] = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      modified: new Date('2024-08-05'),
      tags: ['proposal', 'project', 'important']
    },
    {
      id: '2',
      name: 'Meeting Notes.docx',
      type: 'docx',
      size: '156 KB',
      modified: new Date('2024-08-04'),
      tags: ['meeting', 'notes']
    },
    {
      id: '3',
      name: 'Budget Analysis.xlsx',
      type: 'xlsx',
      size: '892 KB',
      modified: new Date('2024-08-03'),
      tags: ['budget', 'analysis', 'finance']
    },
    {
      id: '4',
      name: 'Company Logo.png',
      type: 'image',
      size: '45 KB',
      modified: new Date('2024-08-02'),
      tags: ['logo', 'brand', 'image']
    },
    {
      id: '5',
      name: 'Requirements.txt',
      type: 'txt',
      size: '8 KB',
      modified: new Date('2024-08-01'),
      tags: ['requirements', 'technical']
    }
  ];

  performSearch(): void {
    // Mock search functionality
    console.log('Searching for:', this.searchTerm, this.selectedType, this.selectedDateRange);
  }

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'pi pi-file-pdf text-red-500',
      'docx': 'pi pi-file-word text-blue-500',
      'xlsx': 'pi pi-file-excel text-green-500',
      'pptx': 'pi pi-file text-orange-500',
      'image': 'pi pi-image text-purple-500',
      'txt': 'pi pi-file text-gray-500'
    };
    return icons[type] || 'pi pi-file text-gray-500';
  }

  getTypeSeverity(type: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" {
    const severities: { [key: string]: "success" | "secondary" | "info" | "warning" | "danger" | "contrast" } = {
      'pdf': 'danger',
      'docx': 'info',
      'xlsx': 'success',
      'pptx': 'warning',
      'image': 'secondary',
      'txt': 'secondary'
    };
    return severities[type] || 'secondary';
  }

  viewDocument(document: Document): void {
    console.log('Viewing document:', document.name);
  }

  downloadDocument(document: Document): void {
    console.log('Downloading document:', document.name);
  }

  showDocumentMenu(document: Document): void {
    console.log('Show menu for document:', document.name);
  }
}