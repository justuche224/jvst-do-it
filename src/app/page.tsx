"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameWeek,
  parseISO,
  getDay,
} from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarIcon,
} from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  day: string;
}

interface DaySection {
  day: string;
  todos: Todo[];
  expanded: boolean;
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function TodoApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [temperature] = useState(64);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    MONDAY: true,
    TUESDAY: false,
    WEDNESDAY: false,
    THURSDAY: false,
    FRIDAY: false,
    SATURDAY: false,
    SUNDAY: false,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem: Todo = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        createdAt: currentDate.toISOString(),
        day: selectedDay,
      };
      setTodos((prevTodos) => [...prevTodos, newTodoItem]);
      setNewTodo("");

      setExpandedSections((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((key) => {
          newState[key] = key === selectedDay;
        });
        return newState;
      });
    }
  };

  const toggleTodo = (todoId: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const changeWeek = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) =>
      direction === "prev" ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setCalendarDate(date);
    setCurrentDate(date);

    const dayIndex = getDay(date);
    // Convert Sunday (0) to 6 for array index
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    if (adjustedIndex >= 0 && adjustedIndex < DAYS.length) {
      const selectedDay = DAYS[adjustedIndex];
      setExpandedSections((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((key) => {
          newState[key] = key === selectedDay;
        });
        return newState;
      });
    }

    setIsCalendarOpen(false);
  };

  const toggleSection = (day: string) => {
    setExpandedSections((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = key === day ? !prev[day] : false;
      });
      return newState;
    });
  };

  const openDeleteModal = (todo: Todo) => {
    setTodoToDelete(todo);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTodoToDelete(null);
  };

  const confirmDelete = () => {
    if (todoToDelete) {
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.id !== todoToDelete.id)
      );
      closeDeleteModal();
    }
  };

  const filteredTodos = todos.filter((todo) =>
    isSameWeek(parseISO(todo.createdAt), currentDate, { weekStartsOn: 1 })
  );

  const sections: DaySection[] = DAYS.map((day) => ({
    day,
    todos: filteredTodos.filter((todo) => todo.day === day),
    expanded: expandedSections[day],
  }));

  return (
    <div className="mx-auto min-h-screen bg-gray-100 dark:bg-gray-900 font-sans md:max-w-none md:px-4">
      <div className="md:grid md:grid-cols-[400px,1fr] md:gap-6 md:py-6 md:max-w-7xl md:mx-auto">
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeWeek("prev")}
              className="text-black dark:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMM d, yyyy"
              )}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeWeek("next")}
              className="text-black dark:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Todo Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 text-black dark:text-white dark:bg-gray-700"
              />
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[140px] text-black dark:text-white">
                  <SelectValue className="text-black dark:text-white" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addTodo} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </div>
          {/* Calendar - Desktop */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg p-4">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={handleDateSelect}
              className="rounded-md"
            />
          </div>
        </div>

        {/* Calendar Button - Mobile */}
        <div className="md:hidden">
          <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <div className="mt-5 mx-5">
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Open Calendar
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calendar</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleDateSelect}
                className="rounded-md"
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4 md:mt-0 space-y-4">
          {/* Todo Sections */}
          {sections.map((section) => (
            <div
              key={section.day}
              className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
                section.expanded
                  ? "p-6"
                  : "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              } md:max-w-none`}
              onClick={() => toggleSection(section.day)}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {section.day}
              </h2>

              {section.expanded && (
                <div className="mt-2 space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(currentDate, "MMMM d, yyyy")} —{" "}
                    {format(new Date(), "h:mma")} — {temperature}°
                  </div>

                  <div className="space-y-3">
                    {section.todos.map((todo) => (
                      <div key={todo.id} className="flex items-start space-x-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span
                          className={`flex-grow ${
                            todo.completed
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTodo(todo.id);
                          }}
                        >
                          {todo.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(todo);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {section.todos.length === 0 && (
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        No todos for {section.day.toLowerCase()} this week
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <div>
              Are you sure you want to delete this todo?
              {todoToDelete && (
                <p className="mt-2 font-semibold">
                  &quot;{todoToDelete.text}&quot;
                </p>
              )}
            </div>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
