export interface Task {
  id: string;
  title: string;
  progress: number;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export interface Plan {
  name: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
  per?: string;
}

export interface NavItem {
  label: string;
  href: string;
}
