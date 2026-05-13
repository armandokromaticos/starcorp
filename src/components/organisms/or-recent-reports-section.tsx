/**
 * Organism: OrRecentReportsSection
 *
 * "Reportes más recientes" — grouped list of departments → projects →
 * tasks. Each project is a navy card; each task shows a progress pill
 * and a white inset card with date + description.
 */

import React, { memo } from 'react';
import { View, Pressable } from '@/src/tw';
import { LinearGradient } from 'expo-linear-gradient';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface ReportTask {
  id: string;
  title: string;
  progress: number;
  dateMonth: string;
  dateDay: string;
  weekLabel: string;
  description: string;
}

interface ReportProject {
  id: string;
  title: string;
  tasks: ReportTask[];
}

interface ReportDepartment {
  id: string;
  name: string;
  icon: MaterialIconName;
  projects: ReportProject[];
}

const DEPARTMENTS: ReportDepartment[] = [
  {
    id: 'admin',
    name: 'Departamento Administrativo',
    icon: 'work-outline',
    projects: [
      {
        id: 'admin-1',
        title: 'Desarrollo del área comercial',
        tasks: [
          {
            id: 'admin-1-t1',
            title: 'Enviar reporte de presupuesto de pauta',
            progress: 50,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
          {
            id: 'admin-1-t2',
            title: 'Evaluar viabilidad de seguir desarrollando K',
            progress: 50,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
          {
            id: 'admin-1-t3',
            title: 'Atacar a los OMNI',
            progress: 10,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
        ],
      },
      {
        id: 'admin-2',
        title: '2da tarea lorem ipsum',
        tasks: [
          {
            id: 'admin-2-t1',
            title: 'Enviar reporte de presupuesto de pauta',
            progress: 50,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
          {
            id: 'admin-2-t2',
            title: 'Evaluar viabilidad de seguir desarrollando K',
            progress: 50,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
        ],
      },
    ],
  },
  {
    id: 'fin',
    name: 'Departamento Financiero',
    icon: 'account-balance',
    projects: [
      {
        id: 'fin-1',
        title: 'Desarrollo del área comercial',
        tasks: [
          {
            id: 'fin-1-t1',
            title: 'Enviar reporte de presupuesto de pauta',
            progress: 50,
            dateMonth: 'FEB',
            dateDay: '02',
            weekLabel: 'Semana Enero 09-13',
            description:
              'Se están realizando los primeros pilotos para generar estafísicas',
          },
        ],
      },
    ],
  },
];

const NAVY_BG = '#0F1B4A';
const NAVY_BORDER = '#1A2B6D';

export const OrRecentReportsSection = memo(() => {
  return (
    <View className="gap-3">
      <View className="px-4">
        <AtTypography variant="h2">Reportes recientes</AtTypography>
      </View>

      <View className="gap-4 px-4">
        {DEPARTMENTS.map((dept) => (
          <DepartmentBlock key={dept.id} department={dept} />
        ))}
      </View>
    </View>
  );
});
OrRecentReportsSection.displayName = 'OrRecentReportsSection';

const DepartmentBlock = memo<{ department: ReportDepartment }>(
  ({ department }) => (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <AtIcon name={department.icon} size={18} color="#1A1F36" />
        <AtTypography variant="bodyBold" color="#1A1F36">
          {department.name}
        </AtTypography>
      </View>

      <View className="gap-3">
        {department.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </View>
    </View>
  ),
);
DepartmentBlock.displayName = 'DepartmentBlock';

const ProjectCard = memo<{ project: ReportProject }>(({ project }) => {
  const taskCount = project.tasks.length;
  return (
    <View
      className="rounded-lg p-4 gap-3"
      style={{
        backgroundColor: NAVY_BG,
        borderCurve: 'continuous',
        boxShadow: '0 4px 12px rgba(15, 27, 74, 0.18)',
      }}
    >
      <View className="flex-row justify-between items-center">
        <AtTypography variant="bodyBold" color="#FFFFFF">
          {project.title}
        </AtTypography>
        <AtTypography variant="caption" color="#8FA0D6">
          {taskCount} {taskCount === 1 ? 'Tarea' : 'Tareas'}
        </AtTypography>
      </View>

      <View className="gap-3">
        {project.tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </View>
    </View>
  );
});
ProjectCard.displayName = 'ProjectCard';

const TaskItem = memo<{ task: ReportTask }>(({ task }) => (
  <Pressable className="gap-2">
    <View className="flex-row items-center gap-2">
      <AtIcon name="check-circle" size={18} color="#5B82E6" />
      <View className="flex-1">
        <AtTypography variant="caption" color="#FFFFFF">
          {task.title}
        </AtTypography>
      </View>
      <AtIcon name="arrow-forward" size={18} color="#FFFFFF" />
    </View>

    <View className="self-start">
      <ProgressPill value={task.progress} />
    </View>

    <View
      className="bg-bg-card rounded-md p-3 flex-row gap-3"
      style={{
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: NAVY_BORDER,
      }}
    >
      <View
        className="rounded-md items-center justify-center px-2 py-1"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.08)',
          backgroundColor: '#FAFBFC',
          minWidth: 48,
        }}
      >
        <AtTypography variant="label" color="#4A5568">
          {task.dateMonth}
        </AtTypography>
        <AtTypography variant="bodyBold" color="#1A1F36">
          {task.dateDay}
        </AtTypography>
      </View>
      <View className="flex-1 gap-0.5">
        <AtTypography variant="bodyBold" color="#1A1F36">
          {task.weekLabel}
        </AtTypography>
        <AtTypography variant="caption" color="#4A5568">
          {task.description}
        </AtTypography>
      </View>
    </View>
  </Pressable>
));
TaskItem.displayName = 'TaskItem';

const ProgressPill = memo<{ value: number }>(({ value }) => {
  const isLow = value < 25;
  const colors = isLow
    ? (['#B8324E', '#7A1F33'] as const)
    : (['#F2A24A', '#E8952E'] as const);
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 999,
        borderCurve: 'continuous',
      }}
    >
      <AtTypography variant="captionBold" color="#FFFFFF">
        {value}%
      </AtTypography>
    </LinearGradient>
  );
});
ProgressPill.displayName = 'ProgressPill';
