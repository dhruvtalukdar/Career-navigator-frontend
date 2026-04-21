import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedJobRole: string;
  onJobRoleChange: (value: string) => void;
  selectedCareerType: string;
  onCareerTypeChange: (value: string) => void;
  selectedMatchLevel: string;
  onMatchLevelChange: (value: string) => void;
  availableRoles: string[];
}

const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedJobRole,
  onJobRoleChange,
  selectedCareerType,
  onCareerTypeChange,
  selectedMatchLevel,
  onMatchLevelChange,
  availableRoles,
}: FilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white border-b border-border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-50 border-border"
        />
      </div>

      {/* Filters with labels */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Job Roles</span>
          <Select value={selectedJobRole} onValueChange={onJobRoleChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="No Job roles selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {[...new Set(availableRoles)].map((role) => (
                <SelectItem key={role} value={role.toLowerCase()}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Career Type</span>
          <Select value={selectedCareerType} onValueChange={onCareerTypeChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="No career type selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="technical">Technical (70%+)</SelectItem>
              <SelectItem value="management">Management (50-69%)</SelectItem>
              <SelectItem value="hybrid">Exploratory (&lt;50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Match Level</span>
          <Select value={selectedMatchLevel} onValueChange={onMatchLevelChange}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="No match bracket selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="high">High Match (70%+)</SelectItem>
              <SelectItem value="medium">Medium Match (50-69%)</SelectItem>
              <SelectItem value="low">Low Match (&lt;50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
