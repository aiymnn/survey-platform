"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Trash2, Edit2, Loader2, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings } from "lucide-react";
import Link from "next/link";
import { getDashboardSurveys } from "@/features/surveys/queries";
import { deleteSurveysAction } from "@/features/surveys/actions";

type SurveyWithDetails = Awaited<ReturnType<typeof getDashboardSurveys>>[number];
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SurveyDataTableProps {
  surveys: SurveyWithDetails[];
}

export function SurveyDataTable({ surveys }: SurveyDataTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination calculations
  const totalItems = surveys.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentSurveys = surveys.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all on current page
      const newSelected = new Set(selectedIds);
      currentSurveys.forEach(s => newSelected.add(s.id));
      setSelectedIds(newSelected);
    } else {
      // Deselect all on current page
      const newSelected = new Set(selectedIds);
      currentSurveys.forEach(s => newSelected.delete(s.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    startTransition(async () => {
      try {
        await deleteSurveysAction(Array.from(selectedIds));
        toast.success(`Successfully deleted ${selectedIds.size} survey(s)`);
        setSelectedIds(new Set());
        // Adjust page if current page becomes empty
        const remainingOnPage = currentSurveys.filter(s => !selectedIds.has(s.id)).length;
        if (remainingOnPage === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } catch (e) {
        toast.error("Failed to delete surveys");
      }
    });
  };

  // Check if all items on CURRENT page are selected
  const isAllCurrentPageSelected = currentSurveys.length > 0 && currentSurveys.every(s => selectedIds.has(s.id));

  return (
    <div className="space-y-4">
      {/* Floating Action Bar (shows when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-muted border p-3 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-medium">
            {selectedIds.size} survey(s) selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {selectedIds.size} survey(s) and remove all associated data, including all responses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete {selectedIds.size} Survey(s)
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* The Data Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>Survey</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSurveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No surveys found.
                </TableCell>
              </TableRow>
            ) : (
              currentSurveys.map((survey) => (
                <TableRow key={survey.id} className="group">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(survey.id)}
                      onCheckedChange={(checked: boolean) => handleSelect(survey.id, checked)}
                      aria-label={`Select ${survey.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{survey.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {survey.description || "No description"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{survey._count.responseSessions}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={survey.status === "DRAFT" ? "secondary" : "default"}>
                      {survey.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {survey.createdBy?.name || survey.createdBy?.email || "Unknown"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(survey.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/surveys/${survey.id}/builder`} className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Builder
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/surveys/${survey.id}/settings`} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Survey Settings
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 border-t border-border/50 bg-card rounded-b-md">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-sm font-medium px-2 sm:px-4 text-center min-w-[80px]">
                Page {currentPage} of {totalPages || 1}
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground sm:border-l sm:pl-4">
              <span>Show</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(val: string) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden sm:inline">entries</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground font-medium">
            Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} surveys
          </div>
        </div>
      )}
    </div>
  );
}
