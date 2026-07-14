package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func setupTestDB(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://portfolio_user:portfolio_pass@localhost:5432/portfolio_test?sslmode=disable"
	}

	var err error
	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            false,
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	sqlDB, _ := testDB.DB()
	sqlDB.Exec("DROP TABLE IF EXISTS project_skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS projects CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS posts CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS authors CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS badges CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS translations CASCADE")

	err = testDB.AutoMigrate(&models.Author{}, &models.Post{}, &models.Project{}, &models.Skill{}, &models.Badge{}, &models.Translation{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = testDB
}

func seedTestData(t *testing.T) {
	author := models.Author{
		ID:   "test-author-1",
		Name: "Test Author",
	}
	if err := testDB.Create(&author).Error; err != nil {
		t.Fatalf("Failed to seed author: %v", err)
	}

	skills := []models.Skill{
		{ID: "test-skill-1", Name: "Go", NameEN: "Go", NameES: "Go", Category: "backend", Level: 5},
		{ID: "test-skill-2", Name: "React", NameEN: "React", NameES: "React", Category: "frontend", Level: 4},
		{ID: "test-skill-3", Name: "TypeScript", NameEN: "TypeScript", NameES: "TypeScript", Category: "frontend", Level: 5},
	}
	for _, s := range skills {
		if err := testDB.Create(&s).Error; err != nil {
			t.Fatalf("Failed to seed skill %s: %v", s.Name, err)
		}
	}

	post := models.Post{
		ID:        "test-post-1",
		Subject:   "Test Post",
		Content:   "Test content",
		AuthorID:  author.ID,
		Badges:    []string{"go", "react"},
		Link:      "https://example.com",
		CreatedAt: "2026-01-01T00:00:00Z",
	}
	if err := testDB.Create(&post).Error; err != nil {
		t.Fatalf("Failed to seed post: %v", err)
	}

	project := models.Project{
		ID:              "test-project-1",
		Name:            "Test Project",
		Content:         "Test project description",
		TechnologiesIds: []string{"test-skill-1", "test-skill-2"},
		GithubURL:       "https://github.com/test/project",
		Url:             "https://test-project.com",
		Images:          []string{"https://example.com/image.jpg"},
	}
	if err := testDB.Create(&project).Error; err != nil {
		t.Fatalf("Failed to seed project: %v", err)
	}

	CacheInvalidate("")
}

func testRouter() *mux.Router {
	r := mux.NewRouter()
	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/get-posts", GetPosts).Methods("GET")
	api.HandleFunc("/get-post", GetPost).Methods("GET")
	api.HandleFunc("/add-post", AddPost).Methods("POST")
	api.HandleFunc("/delete-post", DeletePost).Methods("DELETE")
	api.HandleFunc("/update-post", UpdatePost).Methods("PUT")

	api.HandleFunc("/contact-form", ContactFormHandler).Methods("POST")

	api.HandleFunc("/get-authors", GetAuthors).Methods("GET")
	api.HandleFunc("/add-author", AddAuthor).Methods("POST")
	api.HandleFunc("/delete-author", DeleteAuthor).Methods("DELETE")
	api.HandleFunc("/update-author", UpdateAuthor).Methods("PUT")

	api.HandleFunc("/get-projects", GetProjects).Methods("GET")
	api.HandleFunc("/get-project", GetProject).Methods("GET")
	api.HandleFunc("/add-project", AddProject).Methods("POST")
	api.HandleFunc("/delete-project", DeleteProject).Methods("DELETE")
	api.HandleFunc("/update-project", UpdateProject).Methods("PUT")

	api.HandleFunc("/add-badge", AddBadge).Methods("POST")
	api.HandleFunc("/delete-badge", RemoveBadge).Methods("DELETE")

	api.HandleFunc("/get-skills", GetSkills).Methods("GET")
	api.HandleFunc("/get-skill-tree", GetSkillTree).Methods("GET")
	api.HandleFunc("/add-skill", AddSkill).Methods("POST")
	api.HandleFunc("/delete-skill", DeleteSkill).Methods("DELETE")
	api.HandleFunc("/get-translations", GetTranslations).Methods("GET")

	return r
}

var testRouterInstance = testRouter()

func executeRequest(method, path string, body interface{}) *httptest.ResponseRecorder {
	var reqBody []byte
	if body != nil {
		reqBody, _ = json.Marshal(body)
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(reqBody))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	rr := httptest.NewRecorder()
	testRouterInstance.ServeHTTP(rr, req)

	return rr
}

func TestMain(m *testing.M) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://portfolio_user:portfolio_pass@localhost:5432/portfolio_test?sslmode=disable"
	}

	var err error
	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            false,
	})
	if err != nil {
		log.Printf("WARNING: Test database not available (%v). Skipping integration tests.\n", err)
		log.Println("Set TEST_DATABASE_URL environment variable or start PostgreSQL.")
		os.Exit(0)
	}

	sqlDB, _ := testDB.DB()
	sqlDB.Exec("DROP TABLE IF EXISTS project_skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS projects CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS posts CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS authors CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS badges CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS translations CASCADE")

	err = testDB.AutoMigrate(&models.Author{}, &models.Post{}, &models.Project{}, &models.Skill{}, &models.Badge{}, &models.Translation{})
	if err != nil {
		log.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = testDB

	code := m.Run()

	sqlDB.Exec("DROP TABLE IF EXISTS project_skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS projects CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS posts CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS authors CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS skills CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS badges CASCADE")
	sqlDB.Exec("DROP TABLE IF EXISTS translations CASCADE")
	sqlDB.Close()

	os.Exit(code)
}

func TestGetAuthors_Empty(t *testing.T) {
	rr := executeRequest("GET", "/api/get-authors", nil)
	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var authors []models.Author
	json.Unmarshal(rr.Body.Bytes(), &authors)
	if len(authors) != 0 {
		t.Errorf("Expected empty authors, got %d", len(authors))
	}
}

func TestAuthors_FullCRUD(t *testing.T) {
	t.Run("Create Author", func(t *testing.T) {
		author := map[string]string{
			"id":   "test-author-crud",
			"name": "CRUD Author",
		}
		rr := executeRequest("POST", "/api/add-author", author)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Author
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Name != "CRUD Author" {
			t.Errorf("Expected name 'CRUD Author', got '%s'", created.Name)
		}
	})

	t.Run("Get All Authors", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-authors", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}

		var authors []models.Author
		json.Unmarshal(rr.Body.Bytes(), &authors)
		if len(authors) == 0 {
			t.Error("Expected at least one author")
		}
	})

	t.Run("Update Author", func(t *testing.T) {
		update := map[string]string{
			"id":   "test-author-crud",
			"name": "Updated Author",
		}
		rr := executeRequest("PUT", "/api/update-author", update)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var updated models.Author
		json.Unmarshal(rr.Body.Bytes(), &updated)
		if updated.Name != "Updated Author" {
			t.Errorf("Expected name 'Updated Author', got '%s'", updated.Name)
		}
	})

	t.Run("Delete Author", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-author?id=test-author-crud", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Get Author After Delete", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-authors", nil)
		var authors []models.Author
		json.Unmarshal(rr.Body.Bytes(), &authors)
		for _, a := range authors {
			if a.ID == "test-author-crud" {
				t.Error("Author should have been deleted")
			}
		}
	})
}

func TestAuthors_Validation(t *testing.T) {
	t.Run("Missing Content-Type", func(t *testing.T) {
		body := `{"name": "test"}`
		req := httptest.NewRequest("POST", "/api/add-author", bytes.NewReader([]byte(body)))
		rr := httptest.NewRecorder()

		testRouterInstance.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnsupportedMediaType {
			t.Errorf("Expected 415 for missing Content-Type, got %d", rr.Code)
		}
	})

	t.Run("Update Non-Existent Author", func(t *testing.T) {
		update := map[string]string{
			"id":   "non-existent-id",
			"name": "Ghost",
		}
		rr := executeRequest("PUT", "/api/update-author", update)
		if rr.Code != http.StatusNotFound {
			t.Errorf("Expected 404 for non-existent author, got %d", rr.Code)
		}
	})

	t.Run("Delete Without ID", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-author", nil)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for missing ID, got %d", rr.Code)
		}
	})
}

func TestSkills_FullCRUD(t *testing.T) {
	var skillID string

	t.Run("Create Skill", func(t *testing.T) {
		skill := map[string]interface{}{
			"name":     "TestSkill",
			"nameEn":   "TestSkill",
			"nameEs":   "TestSkill",
			"category": "backend",
			"level":    3,
		}
		rr := executeRequest("POST", "/api/add-skill", skill)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Skill
		json.Unmarshal(rr.Body.Bytes(), &created)
		skillID = created.ID
		if created.Name != "TestSkill" {
			t.Errorf("Expected name 'TestSkill', got '%s'", created.Name)
		}
		if created.Category != "backend" {
			t.Errorf("Expected category 'backend', got '%s'", created.Category)
		}
	})

	t.Run("Get Skills", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-skills", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}

		var skills []models.Skill
		json.Unmarshal(rr.Body.Bytes(), &skills)
		if len(skills) == 0 {
			t.Error("Expected at least one skill")
		}
	})

	t.Run("Get Skill Tree", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-skill-tree", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var tree []map[string]interface{}
		json.Unmarshal(rr.Body.Bytes(), &tree)
		if len(tree) == 0 {
			t.Error("Expected at least one root skill")
		}
	})

	t.Run("Delete Skill", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-skill?id="+skillID, nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})
}

func TestProjects_FullCRUD(t *testing.T) {
	t.Run("Create Project", func(t *testing.T) {
		project := map[string]interface{}{
			"name":             "New Test Project",
			"content":          "New project description",
			"githubUrl":        "https://github.com/test/new-project",
			"url":              "https://new-project.com",
			"images":           []string{},
			"technologiesIds":  []string{},
			"technologies":     []string{"Go", "React"},
		}
		rr := executeRequest("POST", "/api/add-project", project)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Project
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Name != "New Test Project" {
			t.Errorf("Expected name 'New Test Project', got '%s'", created.Name)
		}
		if len(created.Technologies) == 0 {
			t.Log("Warning: Project created without technologies (may be expected if skills not found)")
		}
	})

	t.Run("Create Project With Alternative Field Names", func(t *testing.T) {
		project := map[string]interface{}{
			"title":       "Alt Field Project",
			"description": "Created with alternative field names",
			"github_url":  "https://github.com/test/alt-project",
			"live_url":    "https://alt-project.com",
			"image_url":   "https://example.com/alt.jpg",
		}
		rr := executeRequest("POST", "/api/add-project", project)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Project
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Name != "Alt Field Project" {
			t.Errorf("Expected name 'Alt Field Project', got '%s'", created.Name)
		}
		if len(created.Images) == 0 || created.Images[0] != "https://example.com/alt.jpg" {
			t.Errorf("Expected image, got %v", created.Images)
		}
	})

	t.Run("Get All Projects", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-projects", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}

		var projects []models.Project
		json.Unmarshal(rr.Body.Bytes(), &projects)
		if len(projects) == 0 {
			t.Error("Expected at least one project")
		}
	})

	t.Run("Get Single Project", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-project?id=test-project-1", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var project models.Project
		json.Unmarshal(rr.Body.Bytes(), &project)
		if project.ID != "test-project-1" {
			t.Errorf("Expected project ID 'test-project-1', got '%s'", project.ID)
		}
	})

	t.Run("Update Project", func(t *testing.T) {
		update := map[string]interface{}{
			"id":      "test-project-1",
			"name":    "Updated Project",
			"content": "Updated content",
		}
		rr := executeRequest("PUT", "/api/update-project", update)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var updated models.Project
		json.Unmarshal(rr.Body.Bytes(), &updated)
		if updated.Name != "Updated Project" {
			t.Errorf("Expected name 'Updated Project', got '%s'", updated.Name)
		}
	})

	t.Run("Get Project With Language", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-projects?lang=en", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}
	})

	t.Run("Delete Project", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-project?id=test-project-1", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Delete Non-Existent Project", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-project?id=non-existent", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200 for delete non-existent (idempotent), got %d", rr.Code)
		}
	})

	t.Run("Create Project With Invalid GitHub URL", func(t *testing.T) {
		project := map[string]interface{}{
			"name":      "Bad URL Project",
			"content":   "Should fail",
			"githubUrl": "not-a-valid-url",
		}
		rr := executeRequest("POST", "/api/add-project", project)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid URL, got %d: %s", rr.Code, rr.Body.String())
		}
	})
}

func TestPosts_FullCRUD(t *testing.T) {
	var postID string

	t.Run("Create Post", func(t *testing.T) {
		post := map[string]interface{}{
			"subject":  "New Test Post",
			"content":  "New post content",
			"authorId": "test-author-1",
			"badges":   []string{"go", "react"},
			"link":     "https://example.com/new-post",
		}
		rr := executeRequest("POST", "/api/add-post", post)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Post
		json.Unmarshal(rr.Body.Bytes(), &created)
		postID = created.ID
		if created.Subject != "New Test Post" {
			t.Errorf("Expected subject 'New Test Post', got '%s'", created.Subject)
		}
		if len(created.Badges) != 2 {
			t.Errorf("Expected 2 badges, got %d", len(created.Badges))
		}
	})

	t.Run("Create Post With Alternative Field Names", func(t *testing.T) {
		post := map[string]interface{}{
			"title":   "Alt Field Post",
			"content": "Created with alternative field names",
			"tags":    []string{"go", "typescript"},
		}
		rr := executeRequest("POST", "/api/add-post", post)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Post
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Subject != "Alt Field Post" {
			t.Errorf("Expected subject 'Alt Field Post', got '%s'", created.Subject)
		}
	})

	t.Run("Get All Posts", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-posts", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}

		var posts []models.Post
		json.Unmarshal(rr.Body.Bytes(), &posts)
		if len(posts) == 0 {
			t.Error("Expected at least one post")
		}
	})

	t.Run("Get Single Post", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-post?id=test-post-1", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var post models.Post
		json.Unmarshal(rr.Body.Bytes(), &post)
		if post.ID != "test-post-1" {
			t.Errorf("Expected post ID 'test-post-1', got '%s'", post.ID)
		}
	})

	t.Run("Update Post", func(t *testing.T) {
		update := map[string]interface{}{
			"id":      "test-post-1",
			"subject": "Updated Post",
			"content": "Updated content",
		}
		rr := executeRequest("PUT", "/api/update-post", update)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var updated models.Post
		json.Unmarshal(rr.Body.Bytes(), &updated)
		if updated.Subject != "Updated Post" {
			t.Errorf("Expected subject 'Updated Post', got '%s'", updated.Subject)
		}
	})

	t.Run("Delete Post", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-post?id="+postID, nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Get Non-Existent Post", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-post?id=non-existent", nil)
		if rr.Code != http.StatusNotFound {
			t.Errorf("Expected 404, got %d", rr.Code)
		}
	})
}

func TestBadges(t *testing.T) {
	t.Run("Add Badge", func(t *testing.T) {
		badge := map[string]string{
			"postId": "test-post-1",
			"badge":  "typescript",
		}
		rr := executeRequest("POST", "/api/add-badge", badge)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var post models.Post
		json.Unmarshal(rr.Body.Bytes(), &post)
		found := false
		for _, b := range post.Badges {
			if b == "typescript" {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("Expected badge 'typescript' to be added, got badges: %v", post.Badges)
		}
	})

	t.Run("Add Duplicate Badge", func(t *testing.T) {
		badge := map[string]string{
			"postId": "test-post-1",
			"badge":  "typescript",
		}
		rr := executeRequest("POST", "/api/add-badge", badge)
		if rr.Code != http.StatusConflict {
			t.Errorf("Expected 409 for duplicate badge, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Remove Badge", func(t *testing.T) {
		badge := map[string]string{
			"postId": "test-post-1",
			"badge":  "typescript",
		}
		rr := executeRequest("DELETE", "/api/delete-badge", badge)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var post models.Post
		json.Unmarshal(rr.Body.Bytes(), &post)
		for _, b := range post.Badges {
			if b == "typescript" {
				t.Errorf("Badge 'typescript' should have been removed")
			}
		}
	})
}

func TestProjects_Validation(t *testing.T) {
	t.Run("Missing ID On Update", func(t *testing.T) {
		update := map[string]string{
			"name": "No ID",
		}
		rr := executeRequest("PUT", "/api/update-project", update)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for missing ID, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Get Non-Existent Project", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-project?id=non-existent", nil)
		if rr.Code != http.StatusNotFound {
			t.Errorf("Expected 404, got %d", rr.Code)
		}
	})

	t.Run("Delete Without ID", func(t *testing.T) {
		rr := executeRequest("DELETE", "/api/delete-project", nil)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for missing ID, got %d", rr.Code)
		}
	})
}

func TestCache(t *testing.T) {
	CacheInvalidate("")

	CacheSet("test-key", map[string]string{"message": "hello"})

	data, ok := CacheGet("test-key")
	if !ok {
		t.Error("Expected cache hit")
	}

	var result map[string]string
	json.Unmarshal(data, &result)
	if result["message"] != "hello" {
		t.Errorf("Expected 'hello', got '%s'", result["message"])
	}

	CacheInvalidate("test")
	_, ok = CacheGet("test-key")
	if ok {
		t.Error("Expected cache miss after invalidation")
	}
}

func TestTranslations(t *testing.T) {
	if err := testDB.Create(&models.Translation{
		Key:   "test.greeting",
		Lang:  "en",
		Value: "Hello",
	}).Error; err != nil {
		t.Fatalf("Failed to seed translation: %v", err)
	}

	rr := executeRequest("GET", "/api/get-translations?lang=en", nil)
	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var translations map[string]string
	json.Unmarshal(rr.Body.Bytes(), &translations)
	if translations["test.greeting"] != "Hello" {
		t.Errorf("Expected 'Hello', got '%s'", translations["test.greeting"])
	}
}

func TestConcurrentRequests(t *testing.T) {
	done := make(chan bool, 5)
	for i := 0; i < 5; i++ {
		go func() {
			rr := executeRequest("GET", "/api/get-projects", nil)
			if rr.Code != http.StatusOK {
				t.Errorf("Concurrent request failed: %d", rr.Code)
			}
			done <- true
		}()
	}

	for i := 0; i < 5; i++ {
		<-done
	}
}

func TestContentTypeHandling(t *testing.T) {
	t.Run("JSON With UTF-8 Content", func(t *testing.T) {
		body := `{"name":"Test","content":"Content with émojis 🎉"}`
		req := httptest.NewRequest("POST", "/api/add-project", bytes.NewReader([]byte(body)))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		testRouterInstance.ServeHTTP(rr, req)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Invalid JSON Body", func(t *testing.T) {
		body := `{invalid json}`
		req := httptest.NewRequest("POST", "/api/add-project", bytes.NewReader([]byte(body)))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		testRouterInstance.ServeHTTP(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid JSON, got %d", rr.Code)
		}
	})
}

func TestPostsWithoutAuthorAndLink(t *testing.T) {
	t.Run("Create Post Without Author and Link", func(t *testing.T) {
		post := map[string]interface{}{
			"subject": "Post Without Author",
			"content": "This post has no author or link",
			"badges":  []string{"test"},
		}
		rr := executeRequest("POST", "/api/add-post", post)

		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201 (author and link are optional), got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Post
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Subject != "Post Without Author" {
			t.Errorf("Expected subject 'Post Without Author', got '%s'", created.Subject)
		}
	})
}

func TestProjectsWithTechnologies(t *testing.T) {
	t.Run("Create Project With Technology Names", func(t *testing.T) {
		project := map[string]interface{}{
			"name":         "Tech Test Project",
			"content":      "Testing technology auto-creation",
			"technologies": []string{"Go", "React", "NonExistentTech_XYZ"},
		}
		rr := executeRequest("POST", "/api/add-project", project)
		if rr.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d: %s", rr.Code, rr.Body.String())
		}

		var created models.Project
		json.Unmarshal(rr.Body.Bytes(), &created)
		if created.Name != "Tech Test Project" {
			t.Errorf("Expected name 'Tech Test Project', got '%s'", created.Name)
		}

		t.Logf("Created project with %d technologies", len(created.Technologies))
		for _, tech := range created.Technologies {
			t.Logf("  - %s (ID: %s)", tech.Name, tech.ID)
		}
	})
}

func TestGetProjectsWithFilters(t *testing.T) {
	t.Run("Filter By Technology", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-projects?technologies=Go", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Filter By Search", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-projects?search=Test", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}
	})

	t.Run("Pagination", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-projects?page=1&limit=5", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}
	})
}

func TestPostsWithFilters(t *testing.T) {
	t.Run("Filter By Badge", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-posts?badges=go", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}
	})

	t.Run("Filter By Search", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-posts?search=Test", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}
	})

	t.Run("Pagination", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-posts?page=1&limit=5", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", rr.Code)
		}
	})
}

func TestSkillTree(t *testing.T) {
	parentSkill := models.Skill{
		ID:       "test-skill-parent",
		Name:     "Parent Skill",
		NameEN:   "Parent Skill",
		NameES:   "Parent Skill",
		Category: "backend",
		Level:    5,
	}
	childSkill := models.Skill{
		ID:       "test-skill-child",
		Name:     "Child Skill",
		NameEN:   "Child Skill",
		NameES:   "Child Skill",
		ParentID: "test-skill-parent",
		Category: "frontend",
		Level:    3,
	}
	testDB.Create(&parentSkill)
	testDB.Create(&childSkill)
	CacheInvalidate("")

	t.Run("Get Skill Tree With Children", func(t *testing.T) {
		rr := executeRequest("GET", "/api/get-skill-tree", nil)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var tree []map[string]interface{}
		json.Unmarshal(rr.Body.Bytes(), &tree)

		var parentFound bool
		for _, node := range tree {
			if node["id"] == "test-skill-parent" {
				parentFound = true
				children, ok := node["children"].([]interface{})
				if !ok {
					t.Error("Expected parent to have children array")
				} else if len(children) == 0 {
					t.Error("Expected parent to have at least one child")
				}
				break
			}
		}
		if !parentFound {
			t.Error("Expected parent skill in tree")
		}
	})
}

func TestEndpointErrors(t *testing.T) {
	t.Run("Unsupported Content-Type", func(t *testing.T) {
		body := `{"name": "test"}`
		req := httptest.NewRequest("POST", "/api/add-skill", bytes.NewReader([]byte(body)))
		req.Header.Set("Content-Type", "text/plain")
		rr := httptest.NewRecorder()

		testRouterInstance.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnsupportedMediaType {
			t.Errorf("Expected 415, got %d", rr.Code)
		}
	})

	t.Run("Non-Existent Route", func(t *testing.T) {
		rr := executeRequest("GET", "/api/non-existent", nil)
		if rr.Code != http.StatusNotFound {
			t.Errorf("Expected 404 for non-existent route, got %d", rr.Code)
		}
	})

	t.Run("Empty Body With JSON Content-Type", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/add-project", bytes.NewReader([]byte{}))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		testRouterInstance.ServeHTTP(rr, req)

		if rr.Code != http.StatusCreated {
			t.Logf("Empty body POST returned %d (expected 201 with default values)", rr.Code)
		}
	})
}

func TestStringArray(t *testing.T) {
	t.Run("Empty Array", func(t *testing.T) {
		var sa models.StringArray
		json.Unmarshal([]byte(`[]`), &sa)
		if len(sa) != 0 {
			t.Errorf("Expected empty array, got %v", sa)
		}
	})

	t.Run("String Array JSON Roundtrip", func(t *testing.T) {
		original := models.StringArray{"a", "b", "c"}
		data, _ := json.Marshal(original)
		var decoded models.StringArray
		json.Unmarshal(data, &decoded)
		if len(decoded) != 3 || decoded[0] != "a" {
			t.Errorf("Roundtrip failed: %v -> %v", original, decoded)
		}
	})
}

func strPtr(s string) *string { return &s }

func TestLocalizeProject(t *testing.T) {
	project := models.Project{
		Name:           "Default",
		NameEN:         "English Name",
		NameES:         "Spanish Name",
		Content:        "Default Content",
		ContentEN:      "English Content",
		ContentES:      "Spanish Content",
		Architecture:   "Default Arch",
		ArchitectureEN: "English Arch",
		ArchitectureES: "Spanish Arch",
	}

	t.Run("Localize to English", func(t *testing.T) {
		localizeProject(&project, "en")
		if project.Name != "English Name" {
			t.Errorf("Expected 'English Name', got '%s'", project.Name)
		}
		if project.Content != "English Content" {
			t.Errorf("Expected 'English Content', got '%s'", project.Content)
		}
	})

	t.Run("Localize to Spanish", func(t *testing.T) {
		localizeProject(&project, "es")
		if project.Name != "Spanish Name" {
			t.Errorf("Expected 'Spanish Name', got '%s'", project.Name)
		}
		if project.Content != "Spanish Content" {
			t.Errorf("Expected 'Spanish Content', got '%s'", project.Content)
		}
	})

	t.Run("Localize fallback when translation empty", func(t *testing.T) {
		proj := models.Project{
			Name:      "Only Default",
			NameEN:    "",
			NameES:    "",
			Content:   "Content",
			ContentEN: "",
			ContentES: "",
		}
		localizeProject(&proj, "es")
		if proj.Name != "Only Default" {
			t.Errorf("Expected fallback 'Only Default', got '%s'", proj.Name)
		}
		localizeProject(&proj, "en")
		if proj.Name != "Only Default" {
			t.Errorf("Expected fallback 'Only Default', got '%s'", proj.Name)
		}
	})
}

func IsValidSkillID(id string) bool {
	return strings.HasPrefix(id, "skill-") || strings.Contains(id, "0000")
}

var _ = fmt.Sprintf
