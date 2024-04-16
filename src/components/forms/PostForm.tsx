import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Textarea } from "../ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { PostValidation } from "@/lib/validation"
import { useCreatePost } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import FileUploader from "../shared/FileUploader"
import { Models } from "appwrite"
import { Loader } from "lucide-react"

type PostFormProps = {
    post? : Models.Document;
}

const PostForm = ({ post }: PostFormProps) => {
    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post.caption : "",
            file: [],
            location: post ? post.location : "",
            tags: post ? post.tags.join(',') : ''
        },
    });
    const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
            
    // 2. Define a submit handler.
    const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
        console.log({...value})
        console.log(user.id)
        const newPost = await createPost({
        ...value,
        userId: user.id,
        });
        if (!newPost) {
            toast({title: 'Please try again.'})
        }
        navigate('/');
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
            <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="shad-form_label">Caption</FormLabel>
                    <FormControl>
                    <Textarea className="shad-textarea custom-scrollbar" {...field} />
                    </FormControl>
                    <FormMessage className="shad-form_message"/>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="shad-form_label">Add file</FormLabel>
                    <FormControl>
                    <FileUploader
                        fieldChange={field.onChange}
                        mediaUrl={post?.imageUrl}/>
                    </FormControl>
                    <FormMessage className="shad-form_message"/>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="shad-form_label">Add Location</FormLabel>
                    <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                    </FormControl>
                    <FormMessage className="shad-form_message"/>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="shad-form_label">
                        Add Tags (separated by comma)
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            className="shad-input"
                            placeholder="Art, Expression, Learn, etc."
                            {...field}/>
                    </FormControl>
                    <FormMessage className="shad-form_message"/>
                </FormItem>
                )}
            />
            <div className="flex gap-4 items-center justify-end">
                <Button
                    type="button"
                    className="shad-button_dark_4"
                    onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="shad-button_primary whitespace-nowrap"
                    disabled={isLoadingCreate}>
                    {isLoadingCreate && <Loader />}
                    Post
                </Button>
            </div>
            </form>
        </Form>
    )
}

export default PostForm;