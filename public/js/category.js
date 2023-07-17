const popularPost = document.querySelector(".popular-post");
document.getElementById("search").addEventListener("click", () => {
	fetch(`/blog/?search=${document.getElementById("searchBar").value}`, {
		method: "POST",
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.length > 0) {
				popularPost.innerHTML = "<div class='loader'></div>";
				await new Promise((resolve) => setTimeout(resolve, 1000));
				popularPost.innerHTML = "";
				for (const post of data) {
					const template = `
                <div class="blog-section">
                    <div class="blog-card" data-id="${post.id}">
                        <a href="/blog/${Object.keys(post.categoryTag[0])[0]}/${
						post.id
					}">
                            <img src="${post.bannerSrc}" class="blog-img"/>
                            <h2 style="margin-left:12px">${post.title}</h2>
                            <div class="overview-content">
                                ${post.overview}
                            </div>
                        </a>
                        <a href="/blog/${Object.keys(post.categoryTag[0])[0]}/${
						post.id
					}" class="btn grey">
                            Đọc bài
                        </a>
                    </div>
                </div>
            `;
					popularPost.innerHTML += template;
				}
			} else {
				popularPost.innerHTML = "<div class='loader'></div>";
				await new Promise((resolve) => setTimeout(resolve, 1000));
				popularPost.innerHTML = `<h1 class="empty">Không tìm thấy bất cứ bài viết nào liên quan đến: ${
					document.getElementById("searchBar").value
				}</h1>`;
			}
		});
});
