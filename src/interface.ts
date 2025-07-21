export interface InfoCardProps {
  title: string;
  number: string;
  bgColor: string;
  textColor?: string;
  children: React.ReactNode;
}

export interface Project {
  title: string;
  date: string;
  image: string;
  mockup?: string;
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}
