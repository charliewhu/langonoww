Feature: Persist uploaded text offline
	As a user
	I want my uploaded text to be saved locally
	So that I can access my content even when offline

	Background:
		Given the application is loaded
		And I am offline

	Scenario Outline: Upload text <title>
		Given I add content <title> <content>
		When I navigate to '/texts'
		Then <title> appears in the list

		Examples:
			| title   | content                 |
			| 'hola'  | 'hola amigo como estas' |
			| 'adios' | 'adios mi amor'         |

	Scenario Outline: Read <title> text
		Given I add content <title> <content>
		When I navigate to '/texts'
		And I click <title>
		Then <content> is visible

		Examples:
			| title   | content                 |
			| 'hola'  | 'hola amigo como estas' |
			| 'adios' | 'adios mi amor'         |
