import { LOGIN } from "../lib/paths";

export default function PlatformLogin() {
    // add dropdown for different platforms

    return (
        <a
            href={`${LOGIN}`}
            className="inline-block bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-2 px-4 rounded-full transition-colors"
        >
            Connect with Spotify
        </a>
    )
}