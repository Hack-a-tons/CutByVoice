import argparse
import json
import os
from default_api import reattach_to_session # Assuming default_api is available

def main():
    parser = argparse.ArgumentParser(description="Reattach to an existing Raindrop development session.")
    parser.add_argument("--session-id", type=str, help="The session ID to reattach to.")
    parser.add_argument("--old-timeline-id", type=str, help="The old timeline ID to reattach from.")
    args = parser.parse_args()

    session_id = args.session_id
    old_timeline_id = args.old_timeline_id

    if not session_id or not old_timeline_id:
        config_file = ".raindrop.config.local.json"
        if os.path.exists(config_file):
            with open(config_file, "r") as f:
                try:
                    configs = json.load(f)
                    if isinstance(configs, list) and configs:
                        last_config = configs[-1]
                        if not session_id:
                            session_id = last_config.get("session_id")
                        if not old_timeline_id:
                            old_timeline_id = last_config.get("timeline_id")
                except json.JSONDecodeError:
                    print(f"Warning: Could not decode JSON from {config_file}. Skipping.")

    if not session_id or not old_timeline_id:
        session_id = input("Please enter the session ID: ")
        old_timeline_id = input("Please enter the old timeline ID: ")

    if not session_id or not old_timeline_id:
        print("Error: Session ID and old timeline ID are required.")
        return

    print(f"Reattaching to session: {session_id} with timeline: {old_timeline_id}")
    response = reattach_to_session(session_id=session_id, old_timeline_id=old_timeline_id)
    print(response)

if __name__ == "__main__":
    main()
