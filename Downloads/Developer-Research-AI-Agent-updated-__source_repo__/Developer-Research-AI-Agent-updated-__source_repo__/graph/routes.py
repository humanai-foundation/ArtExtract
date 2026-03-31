from state import AgentState


def planner_router(state: AgentState):
    # Logic to decide mode
    deep_criteria = ["architecture", "research", "comparison"]
    mode = "deep" if state["intent"] in deep_criteria else "quick"
    
    plan = ["search documentation", "analyze trade-offs"] # Simplified
    return {"mode": mode, "plan": plan}