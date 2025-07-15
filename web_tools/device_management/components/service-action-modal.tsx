"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDataCenterStore } from "@/lib/data-center-store"

interface ServiceActionModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string | null
  mode: "add" | "edit"
}

const serviceFormSchema = z.object({
  name: z.string().min(2, {
    message: "Service name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.enum(["Active", "Inactive", "Maintenance", "Planned"]),
  criticality: z.enum(["Low", "Medium", "High", "Critical"]),
  owner: z.string().optional(),
  department: z.string().optional(),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

export function ServiceActionModal({ isOpen, onClose, serviceId, mode }: ServiceActionModalProps) {
  const { addService, updateService, getService } = useDataCenterStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
      criticality: "Medium",
      owner: "",
      department: "",
    },
  })

  useEffect(() => {
    if (mode === "edit" && serviceId) {
      const service = getService(serviceId)
      if (service) {
        form.reset({
          name: service.name,
          description: service.description,
          status: service.status,
          criticality: service.criticality,
          owner: service.owner || "",
          department: service.department || "",
        })
      }
    } else {
      form.reset({
        name: "",
        description: "",
        status: "Active",
        criticality: "Medium",
        owner: "",
        department: "",
      })
    }
  }, [form, mode, serviceId, getService])

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true)
    try {
      if (mode === "add") {
        addService(data)
      } else if (mode === "edit" && serviceId) {
        updateService(serviceId, data)
      }
      onClose()
    } catch (error) {
      console.error("Error saving service:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Service" : "Edit Service"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new service in the system." : "Update the details of the existing service."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter service description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criticality</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select criticality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service owner" {...field} />
                  </FormControl>
                  <FormDescription>Optional: The person responsible for this service</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department" {...field} />
                  </FormControl>
                  <FormDescription>Optional: The department that owns this service</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "add" ? "Add Service" : "Update Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
