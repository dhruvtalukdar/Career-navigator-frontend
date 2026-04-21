Career Development Context
Upward Movement (Vertical Growth): Moving up the corporate ladder, characterized by promotions, increased responsibility, higher pay, and new titles. It focuses on depth and climbing higher in the organization.
- Top 2 matching Upward Movement roles will be shown here, along with their details and a match percentage. More actions are available in the menu option.

Lateral Movement (Horizontal Growth): Moving to a different role, team, or department at the same level of responsibility and pay. It is used to build a broader, more versatile skill set, enhance networking, and increase job satisfaction without a promotion.
- Top 2 matching job roles will be shown for Lateral Movement here, along with their details and a match percentage. More actions are available in the menu option.

Change Scope (Job Expansion/Reduction): Altering the responsibilities or boundaries of a current role. This can mean taking on broader responsibilities ("expanding scope") for a more senior role or "reducing scope" to focus on a more specialized area. 



## There are 3 cones (angular regions):

Upward movement
	Angle range: 45° → 135° (centered at 90°)

Lateral movement
	Angle range: 315° → 45° (i.e., +45° to -45°)
	This is the right side

Change scope
	Angle range: 225° → 315°
	Bottom 90° area
	
	
## Node movement classification (based on PL difference)

If PL < currentPL → Upward

If PL = currentPL → Lateral

If PL > currentPL → Change scope

Circles represent PL levels
All circles share the same center and same radii, forming a full 360° grid. So a circle looks like a complete ring around the center (full 360°), and each cone uses the part of that ring inside its angle?
“We have different levels of circles with varying radii. Each circle will have the same radius everywhere.”
So the circles are global, and cones are just angular segments.

Center = current PL
Circles expand outward for lower PL (Upward movement)
Circles expand downward for higher PL (Change scope)


## Node placement inside a cone
	Each PL circle inside a cone can hold max 2 nodes.
	If a cone+PL has:
	1 node → place at center of the cone angle range
	2 nodes → place left and right offset from center (within the cone)
	3+ nodes → show the first 2, rest go into:
	“+X more” badge/button for that cone & PL
	
	
## Positioning logic inside a cone

	To place 1 or 2 nodes inside a cone:
	For a cone defined by:
	startAngle, endAngle

	The midpoint is:
	midAngle = (startAngle + endAngle) / 2


	For 2 nodes:
	angle1 = midAngle - (coneWidth * 0.15)
	angle2 = midAngle + (coneWidth * 0.15)

	Where coneWidth = endAngle - startAngle (90°).
	
	
## Progression Reveal System
📌 Circles: PL levels
Center circle = current PL (e.g., PL11)
Next outer circle = lower PL (PL10 → upward)
Next outer circle = PL9

etc.

📌 But here is the KEY part you explained:
PL9 node should NOT be shown immediately. It only appears when the user clicks the PL10 node.

This means:
Nodes deeper in the progression (farther PL differences)
are children of the previous PL node inside the same cone.

Example:
Current PL = PL11
Node A: PL10 (Upward) → show this immediately
Node B: PL9 (Upward) → show this ONLY when PL10 node is expanded
This creates a career path chain inside a cone.

Cone: Upward
PL11 (current PL)
  └── PL10 → shown immediately
        └── PL9 → hidden under PL10
              └── PL8 → hidden under PL9


## Behaviour :
1️⃣ When a PL10 node is clicked, the PL9 node should appear IN the same cone and circle position (just pushed outward)
Meaning:

	PL10 = circle radius R1
	PL9 = radius R2

	Same angle placement rules (within the upward cone)
	
Each PL node can have its own children
Example:

PL10 (Node A)
  └── PL9 (Node C)

PL10 (Node B)
  └── PL9 (Node D)

  Behaviour: 

  When the user clicks PL10(Node 1) only one PL9 would be there(Node 1.1) and it will be on the same angle as Node 1. 
  And if the user clicks PL9(Node 1.1) then only he will get to see the next node, PL8(Node 1.1.1) and it will be on the same angle as Node 1. 
  So basically only one child per node, Node 1 -> Node 1.1 -> Node 1.1.1 (They will form a straight line)